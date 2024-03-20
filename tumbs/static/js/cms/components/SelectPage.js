import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { _ } from "../i18n";
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
  const addDisabled = creationStatus === "loading" || reorderStatus === "loading";
  const dragDisabled = addDisabled || website.pages.length < 2;

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

  const swapPages = (p1, p2) => {
    setReorderStatus("loading");
    Promise.all([
      apiService.request("update_page", {
        args: { page_id: p1.id },
        payload: {
          ...p1,
          order: p2.order,
        },
      }),
      apiService.request("update_page", {
        args: { page_id: p2.id },
        payload: {
          ...p2,
          order: p1.order,
        },
      }),
    ])
      .then(() => {
        setReorderStatus("success");
      })
      .catch((err) => {
        setReorderStatus("error");
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

      const reordered = [...website.pages];
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);

      const [p1] = website.pages.toSpliced(source.index, 1);
      const [p2] = website.pages.toSpliced(destination.index, 1);
      swapPages(p1, p2);

      dispatch(
        stashActions.updateWebsite({
          ...website,
          pages: reordered,
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
              <Button
                variant="link"
                className="ms-auto"
                title={_("Add page")}
                onClick={createPage}
                disabled={addDisabled}
              >
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
