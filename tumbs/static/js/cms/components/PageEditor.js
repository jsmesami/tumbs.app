import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { _ } from "../i18n";
import { apiService } from "../network";
import { actions as stashActions } from "../slices/stash";
import { actions as alertsActions } from "../slices/alerts";
import Textual from "./widgets/Textual";
import Gallery from "./widgets/Gallery";
import Profile from "./widgets/Profile";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

const widgetComponent = ({ type, ...props }, index) => {
  switch (type) {
    case "textual":
      return <Textual key={index} {...props} />;
    case "gallery":
      return <Gallery key={index} {...props} />;
    case "profile":
      return <Profile key={index} {...props} />;
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

const WidgetsMenu = ({ onClick, addDisabled }) => {
  return (
    <div className="mt-4 mb-4 d-flex justify-content-center gap-3">
      <OverlayTrigger overlay={<Tooltip>{widgetName.gallery}</Tooltip>}>
        <Button variant="outline-secondary" size="sm" onClick={onClick("gallery")} disabled={addDisabled}>
          <i className="bi-images" />
        </Button>
      </OverlayTrigger>
      <OverlayTrigger overlay={<Tooltip>{widgetName.textual}</Tooltip>}>
        <Button variant="outline-secondary" size="sm" onClick={onClick("textual")} disabled={addDisabled}>
          <i className="bi-body-text" />
        </Button>
      </OverlayTrigger>
      <OverlayTrigger overlay={<Tooltip>{widgetName.profile}</Tooltip>}>
        <Button variant="outline-secondary" size="sm" onClick={onClick("profile")} disabled={addDisabled}>
          <i className="bi-person-lines-fill" />
        </Button>
      </OverlayTrigger>
    </div>
  );
};

const WidgetWrapper = ({ widget, dragDisabled, delDisabled, index, children }) => {
  return (
    <Draggable draggableId={`widget-${index}`} isDragDisabled={dragDisabled} index={index}>
      {(provided) => (
        <div className="widget-wrapper" ref={provided.innerRef} {...provided.draggableProps}>
          <div className="widget-drag-handle" {...provided.dragHandleProps}>
            <i className="bi-grip-horizontal" />
            {widgetName[widget.type]}
          </div>
          <button className="btn btn-link widget-delete-button" disabled={delDisabled}>
            <i className="bi-x" />
          </button>
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
  const [addStatus, setAddStatus] = useState("initial");
  const [reorderStatus, setReorderStatus] = useState("initial");
  const addDisabled = addStatus === "loading" || reorderStatus === "loading";
  const delDisabled = addDisabled;
  const dragDisabled = addDisabled || (page && page.content.length < 2);

  const addWidget = (type) => () => {
    const newWidget = widgetDefault[type];
    setAddStatus("loading");
    apiService
      .request("update_page", {
        args: { page_id: page.id },
        payload: {
          ...page,
          content: [newWidget, ...page.content],
        },
      })
      .then((page) => {
        setAddStatus("success");
        dispatch(stashActions.addWidget({ websiteId: website.id, pageId: page.id, widget: newWidget }));
      })
      .catch((err) => {
        setAddStatus("error");
        dispatch(
          alertsActions.addAlert({
            content: _('Could not add content: "{err}"').supplant({ err: String(err) }),
            severity: "danger",
          }),
        );
        // TODO: notify Sentry
      });
  };

  const reorderWidgets = (newPage, oldPage) => {
    setReorderStatus("loading");
    apiService
      .request("update_page", {
        args: { page_id: newPage.id },
        payload: newPage,
      })
      .then(() => {
        setReorderStatus("success");
      })
      .catch((err) => {
        setReorderStatus("error");
        dispatch(
          alertsActions.addAlert({
            content: _('Could not update widgets order: "{err}"').supplant({ err: String(err) }),
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
  };

  const onDragEnd =
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
    };

  return (
    page && (
      <>
        <WidgetsMenu onClick={addWidget} addDisabled={addDisabled} />

        <DragDropContext onDragEnd={onDragEnd(page)}>
          <Droppable droppableId="widgets" direction="vertical">
            {(provided) => (
              <div className="widgets" {...provided.droppableProps} ref={provided.innerRef}>
                {page.content.map((widget, index) => (
                  <WidgetWrapper {...{ widget, delDisabled, dragDisabled, index }} key={index}>
                    {widgetComponent(widget, index)}
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
