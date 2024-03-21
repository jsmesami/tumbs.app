import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { _ } from "../i18n";
import { maxPages } from "../config";
import { apiService } from "../network";
import { actions as alertsActions } from "../slices/alerts";
import { actions as dialogsActions } from "../slices/dialogs";
import { actions as pagesActions } from "../slices/pages";
import { actions as stashActions } from "../slices/stash";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button, Nav } from "react-bootstrap";

const PageTab = ({ page: { id, title }, active, dragDisabled, index }) => {
  const dispatch = useDispatch();
  const showPageDetailsDialog = () => dispatch(dialogsActions.showDialog("pageDetails"));

  return (
    <Draggable draggableId={id.toString()} isDragDisabled={dragDisabled} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <Nav.Item>
            {active ? (
              <Nav.Link eventKey={id}>
                {title}
                &ensp;
                <i className="bi-gear" title={_("Edit page details")} onClick={showPageDetailsDialog} />
              </Nav.Link>
            ) : (
              <Nav.Link eventKey={id}>{title}</Nav.Link>
            )}
          </Nav.Item>
        </div>
      )}
    </Draggable>
  );
};

const SelectPage = ({ website }) => {
  const dispatch = useDispatch();
  const pageId = useSelector((state) => state.pages.currentId);
  const page = website.pages.find((p) => p.id === pageId);
  const [creationStatus, setCreationStatus] = useState("initial");
  const [reorderStatus, setReorderStatus] = useState("initial");
  const isBusy = creationStatus === "loading" || reorderStatus === "loading";
  const addDisabled = isBusy || website.pages.length >= maxPages;
  const dragDisabled = isBusy || website.pages.length < 2;

  const setCurrent = (id) => dispatch(pagesActions.setCurrentId(parseInt(id)));

  useEffect(() => {
    if (!page && website.pages.length) {
      setCurrent(website.pages[0].id);
    }
  }, [website]);

  const createPage = useCallback(() => {
    setCreationStatus("loading");
    apiService
      .request("create_page", {
        payload: {
          website_id: website.id,
          title: _("Page {pageN}").supplant({ pageN: website.pages.length }),
        },
      })
      .then((page) => {
        setCreationStatus("success");
        dispatch(stashActions.addPage({ websiteId: website.id, page: page }));
        setCurrent(page.id);
      })
      .catch((err) => {
        setCreationStatus("error");
        dispatch(
          alertsActions.addAlert({
            content: _('Could not create page: "{err}"').supplant({ err: String(err) }),
            severity: "danger",
          }),
        );
        // TODO: notify Sentry
      });
  }, [website]);

  const reorderPages = (reordered, oldOrder) => {
    setReorderStatus("loading");
    Promise.all(
      reordered.map((pg, index) =>
        apiService.request("update_page", {
          args: { page_id: pg.id },
          payload: {
            ...pg,
            order: index,
          },
        }),
      ),
    )
      .then(() => {
        setReorderStatus("success");
      })
      .catch((err) => {
        setReorderStatus("error");
        dispatch(
          stashActions.updateWebsite({
            ...website,
            pages: oldOrder,
          }),
        );
        dispatch(
          alertsActions.addAlert({
            content: _('Could not update pages order: "{err}"').supplant({ err: String(err) }),
            severity: "danger",
          }),
        );
        // TODO: notify Sentry
      });
  };

  const onDragEnd = useCallback(
    ({ source, destination }) => {
      if (!destination || destination.index === source.index) return;

      const oldOrder = [...website.pages];
      const newOrder = [...website.pages];
      const [removed] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, removed);

      reorderPages(newOrder, oldOrder);

      dispatch(
        stashActions.updateWebsite({
          ...website,
          pages: newOrder,
        }),
      );
    },
    [website],
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="nav-pages" direction="horizontal">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <Nav variant="tabs" activeKey={pageId} onSelect={setCurrent}>
              {website.pages.map((pg, index) => (
                <PageTab page={pg} active={pg.id === pageId} dragDisabled={dragDisabled} key={pg.id} index={index} />
              ))}
              {provided.placeholder}
              <Button variant="link" title={_("Add page")} onClick={createPage} disabled={addDisabled}>
                <i className="bi-plus-circle text-success" />
              </Button>
            </Nav>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SelectPage;
