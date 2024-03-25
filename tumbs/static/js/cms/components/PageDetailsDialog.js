import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { _ } from "../i18n";
import { actions as alertsActions } from "../slices/alerts";
import { actions as dialogsActions } from "../slices/dialogs";
import { actions as stashActions } from "../slices/stash";
import { apiService } from "../network";
import { autoDismissMs } from "../config";
import CollapseArea from "./CollapseArea";
import DeleteDialog from "./DeleteDialog";
import SeoBadge from "./SeoBadge";
import { Button, Form, Offcanvas } from "react-bootstrap";

const DeletePage = ({ website, page, disabled, onSubmit, onSuccess, onError }) => {
  const dispatch = useDispatch();

  const handleDelete = useCallback(
    (page) => (e) => {
      e.stopPropagation();
      onSubmit();
      apiService
        .request("delete_page", {
          args: { page_id: page.id },
        })
        .then(() => {
          dispatch(
            alertsActions.addAlert({
              content: _('Page "{title}" has been successfully deleted.').supplant({ title: page.title }),
              severity: "success",
              autoDismissMs: autoDismissMs,
            }),
          );
          dispatch(stashActions.deletePage({ websiteId: website.id, pageId: page.id }));
          onSuccess();
        })
        .catch((err) => {
          dispatch(
            alertsActions.addAlert({
              content: _('Could not delete page "{title}": "{err}"').supplant({
                title: page.title,
                err: err,
              }),
              severity: "danger",
            }),
          );
          // TODO: notify Sentry
          onError();
        });
    },
    [website, page],
  );

  return (
    <DeleteDialog
      body={_("Deleting a page is irreversible and removes all of its content.")}
      placement="top"
      disabled={disabled}
      handleDelete={handleDelete(website)}
    >
      <Button variant="outline-warning" disabled={disabled}>
        <i className="bi-trash" />
        &ensp;{_("Delete page")}
      </Button>
    </DeleteDialog>
  );
};

const PageDetailsDialog = ({ website }) => {
  const pageId = useSelector((state) => state.pages.currentId);
  const page = website.pages.find((p) => p.id === pageId);
  const dispatch = useDispatch();
  const dialogId = useSelector((state) => state.dialogs.visibleDialogId);
  const visible = dialogId === "pageDetails";
  const [status, setStatus] = useState("initial");
  const isLoading = status === "loading";

  const hide = () => dispatch(dialogsActions.hideDialogs());
  const onSubmit = () => setStatus("loading");
  const onSuccess = () => {
    setStatus("success");
    hide();
  };
  const onError = () => {
    setStatus("error");
    hide();
  };

  const haveValuesChanged = (form, page) => {
    return ["title", "description"].some((field) => form[field].value !== page[field]);
  };

  const handleSubmit = useCallback(
    (page) => (e) => {
      e.preventDefault();
      if (!haveValuesChanged(e.target, page)) {
        hide();
        return;
      }

      onSubmit();
      apiService
        .request("update_page", {
          args: { page_id: page.id },
          payload: {
            ...page,
            ...{
              title: e.target.title.value,
              description: e.target.description.value,
            },
          },
        })
        .then((data) => {
          dispatch(stashActions.updatePage({ websiteId: website.id, page: data }));
          onSuccess();
        })
        .catch((err) => {
          dispatch(
            alertsActions.addAlert({
              content: _('Could not update page details: "{err}"').supplant({ err: err }),
              severity: "danger",
            }),
          );
          // TODO: notify Sentry
          onError();
        });
    },
    [website, page],
  );

  return (
    page && (
      <Offcanvas show={visible} onHide={hide} placement="end" aria-labelledby="pageDetailsLabel">
        <Form onSubmit={handleSubmit(page)}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="pageDetailsLabel">{_("Page Details")}</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Form.Group className="mb-3">
              <Form.Label>{_("Title")}</Form.Label>
              <Form.Control
                type="text"
                name="title"
                defaultValue={page.title}
                required
                disabled={isLoading}
                placeholder={_("Title")}
                autoFocus
                maxLength="255"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {_("Description")} <SeoBadge />
              </Form.Label>
              <Form.Control
                type="text"
                as="textarea"
                rows={4}
                name="description"
                defaultValue={page.description}
                disabled={isLoading}
                placeholder={_("What is the page for? What's in it? ")}
                maxLength="255"
              />
            </Form.Group>

            <CollapseArea className="mt-3" title={_("Advanced")}>
              <DeletePage {...{ website, page, disabled: isLoading, onSubmit, onSuccess, onError }} />
            </CollapseArea>

            <div className="d-flex justify-content-between mt-5">
              <Button variant="secondary" disabled={isLoading} onClick={hide}>
                <>
                  <i className="bi-x-circle" aria-hidden="true" />
                  &ensp;<span>{_("Close")}</span>
                </>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <i className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" />
                    &ensp;<span>{_("Saving")}</span>
                  </>
                ) : (
                  <>
                    <i className="bi-floppy" aria-hidden="true" />
                    &ensp;<span>{_("Save changes")}</span>
                  </>
                )}
              </Button>
            </div>
          </Offcanvas.Body>
        </Form>
      </Offcanvas>
    )
  );
};

export default PageDetailsDialog;
