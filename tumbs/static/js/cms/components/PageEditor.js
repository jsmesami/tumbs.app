import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { _ } from "../i18n";
import { apiService } from "../network";
import { actions as stashActions } from "../slices/stash";
import { actions as alertsActions } from "../slices/alerts";
import DeleteDialog from "./DeleteDialog";
import Textual from "./widgets/Textual";
import Gallery from "./widgets/Gallery";
import Profile from "./widgets/Profile";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Button, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";

const widgetComponent = (page, widget, index, onChange) => {
  const props = { key: index, widget: widget, onChange: onChange(page, index) };
  switch (widget.type) {
    case "textual":
      return <Textual {...props} />;
    case "gallery":
      return <Gallery {...props} />;
    case "profile":
      return <Profile {...props} />;
  }
};

const widgetDefault = {
  textual: { type: "textual" },
  gallery: { type: "gallery" },
  profile: { type: "profile" },
};

const widgetName = {
  textual: _("Rich text"),
  gallery: _("Gallery"),
  profile: _("Profile"),
};

const WidgetsMenu = ({ onClick, addingDisabled }) => {
  return (
    <div className="mt-4 mb-4 d-flex justify-content-center gap-3">
      <OverlayTrigger overlay={<Tooltip>{widgetName.gallery}</Tooltip>}>
        <Button variant="outline-secondary" size="sm" onClick={onClick("gallery")} disabled={addingDisabled}>
          <i className="bi-images" />
        </Button>
      </OverlayTrigger>
      <OverlayTrigger overlay={<Tooltip>{widgetName.textual}</Tooltip>}>
        <Button variant="outline-secondary" size="sm" onClick={onClick("textual")} disabled={addingDisabled}>
          <i className="bi-body-text" />
        </Button>
      </OverlayTrigger>
      <OverlayTrigger overlay={<Tooltip>{widgetName.profile}</Tooltip>}>
        <Button variant="outline-secondary" size="sm" onClick={onClick("profile")} disabled={addingDisabled}>
          <i className="bi-person-lines-fill" />
        </Button>
      </OverlayTrigger>
    </div>
  );
};

const DeleteWidget = ({ disabled, onDelete }) => {
  return (
    <DeleteDialog
      body={_("Deleting a block is irreversible and removes all of its content.")}
      placement="left"
      disabled={disabled}
      handleDelete={onDelete}
    >
      <button className="btn btn-link widget-delete-button" disabled={disabled}>
        <i className="bi-x" />
      </button>
    </DeleteDialog>
  );
};

const WidgetWrapper = ({ widget, dragDisabled, isLoading, onDelete, index, children }) => {
  return (
    <Draggable draggableId={`widget-${index}`} isDragDisabled={dragDisabled} index={index}>
      {(provided) => (
        <div className="widget-wrapper" ref={provided.innerRef} {...provided.draggableProps}>
          <div className="widget-drag-handle" {...provided.dragHandleProps}>
            <i className="bi-grip-horizontal" />
            {widgetName[widget.type]}
            {isLoading ? <Spinner animation="grow" size="sm" /> : null}
          </div>
          <DeleteWidget index={index} disabled={isLoading} onDelete={onDelete} />
          {children}
        </div>
      )}
    </Draggable>
  );
};

const PageEditor = ({ website }) => {
  const dispatch = useDispatch();
  const pageId = useSelector((state) => state.pages.currentId);
  const page = website.pages.find((p) => p.id === pageId);
  const [addingStatus, setAddingStatus] = useState("initial");
  const [reorderingStatus, setReorderingStatus] = useState("initial");
  const [savingStatus, setSavingStatus] = useState({});
  const widgetSaving = (index) => savingStatus[index] === "loading";
  const anyWidgetSaving = Object.values(savingStatus).some((v) => v === "loading");
  const addingDisabled = addingStatus === "loading" || reorderingStatus === "loading";
  const reorderingDisabled = addingDisabled || anyWidgetSaving || (page && page.content.length < 2);

  const addWidget = useCallback(
    (type) => () => {
      const newWidget = widgetDefault[type];
      setAddingStatus("loading");
      apiService
        .request("update_page", {
          args: { page_id: page.id },
          payload: {
            ...page,
            content: [newWidget, ...page.content],
          },
        })
        .then((page) => {
          setAddingStatus("success");
          dispatch(stashActions.addWidget({ websiteId: website.id, pageId: page.id, widget: newWidget }));
        })
        .catch((err) => {
          setAddingStatus("error");
          dispatch(
            alertsActions.addAlert({
              content: _('Could not add content: "{err}"').supplant({ err: err }),
              severity: "danger",
            }),
          );
          // TODO: notify Sentry
        });
    },
    [website, page],
  );

  const reorderWidgets = useCallback(
    (newPage, oldPage) => {
      setReorderingStatus("loading");
      apiService
        .request("update_page", {
          args: { page_id: newPage.id },
          payload: newPage,
        })
        .then(() => {
          setReorderingStatus("success");
        })
        .catch((err) => {
          setReorderingStatus("error");
          dispatch(
            alertsActions.addAlert({
              content: _('Could not update widgets order: "{err}"').supplant({ err: err }),
              severity: "danger",
            }),
          );
          dispatch(
            stashActions.updatePage({
              websiteId: website.id,
              page: oldPage,
            }),
          );
          // TODO: notify Sentry
        });
    },
    [website, page],
  );

  const onDragEnd = useCallback(
    (page) =>
      ({ source, destination }) => {
        if (!destination || destination.index === source.index) return;

        const newOrder = [...page.content];
        const [removed] = newOrder.splice(source.index, 1);
        newOrder.splice(destination.index, 0, removed);

        const newPage = {
          ...page,
          content: newOrder,
        };
        reorderWidgets(newPage, page);

        dispatch(
          stashActions.updatePage({
            websiteId: website.id,
            page: newPage,
          }),
        );
      },
    [website, page],
  );

  const updateWidget = useCallback(
    (page, index) => (widget) => {
      const newContent = [...page.content];
      newContent[index] = widget;

      setSavingStatus({ ...savingStatus, ...{ [index]: "loading" } });
      apiService
        .request("update_page", {
          args: { page_id: page.id },
          payload: {
            ...page,
            content: newContent,
          },
        })
        .then((page) => {
          setSavingStatus({ ...savingStatus, ...{ [index]: "success" } });
          dispatch(
            stashActions.updateWidget({
              websiteId: website.id,
              pageId: page.id,
              index: index,
              widget: widget,
            }),
          );
        })
        .catch((err) => {
          setSavingStatus({ ...savingStatus, ...{ [index]: "error" } });
          dispatch(
            alertsActions.addAlert({
              content: _('Could not save content: "{err}"').supplant({ err: err }),
              severity: "danger",
            }),
          );
          // TODO: notify Sentry
        });
    },
    [website, page],
  );

  const deleteWidget = useCallback(
    (page, index) => () => {
      const newContent = [...page.content];
      newContent.splice(index, 1);
      const oldPage = { ...page };
      const newPage = { ...page, ...{ content: newContent } };

      dispatch(stashActions.updatePage({ websiteId: website.id, page: newPage }));
      apiService
        .request("update_page", {
          args: { page_id: page.id },
          payload: {
            ...page,
            content: newContent,
          },
        })
        .catch((err) => {
          dispatch(stashActions.updatePage({ websiteId: website.id, page: oldPage }));
          dispatch(
            alertsActions.addAlert({
              content: _('Could not delete widget: "{err}"').supplant({
                title: page.title,
                err: err,
              }),
              severity: "danger",
            }),
          );
          // TODO: notify Sentry
        });
    },
    [website, page],
  );

  return (
    page && (
      <>
        <WidgetsMenu onClick={addWidget} addingDisabled={addingDisabled} />

        <DragDropContext onDragEnd={onDragEnd(page)}>
          <Droppable droppableId="widgets" direction="vertical">
            {(provided) => (
              <div className="widgets" {...provided.droppableProps} ref={provided.innerRef}>
                {page.content.map((widget, index) => (
                  <WidgetWrapper
                    widget={widget}
                    dragDisabled={reorderingDisabled}
                    isLoading={widgetSaving(index)}
                    onDelete={deleteWidget(page, index)}
                    index={index}
                    key={index}
                  >
                    {widgetComponent(page, widget, index, updateWidget)}
                  </WidgetWrapper>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </>
    )
  );
};

export default PageEditor;