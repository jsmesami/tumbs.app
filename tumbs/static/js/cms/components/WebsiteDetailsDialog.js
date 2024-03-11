import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { _ } from "../i18n";
import { actions as alertsActions } from "../slices/alerts";
import { actions as dialogsActions } from "../slices/dialogs";
import { actions as stashActions } from "../slices/stash";
import { apiService } from "../network";
import { autoDismissMs, INIT } from "../config";
import CollapseArea from "./CollapseArea";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Offcanvas from "react-bootstrap/Offcanvas";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

const DeleteWebsite = ({ website, onSubmit }) => {
  const dispatch = useDispatch();

  const handleDelete = useCallback(
    (website) => (e) => {
      e.stopPropagation();
      onSubmit && onSubmit();
      apiService
        .request("delete_website", {
          args: { website_id: website.id },
        })
        .then(() => {
          dispatch(
            alertsActions.addAlert({
              content: _('Site "{title}" has been successfully deleted.').supplant({ title: website.name }),
              severity: "success",
              autoDismissMs: autoDismissMs,
            }),
          );
          dispatch(stashActions.deleteWebsite({ websiteId: website.id }));
        })
        .catch((err) => {
          dispatch(
            alertsActions.addAlert({
              content: _('Could not delete site "{name}": "{err}"').supplant({ name: website.name, err: String(err) }),
              severity: "danger",
            }),
          );
          // TODO: notify Sentry
        });
    },
    [website],
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement="top"
      overlay={
        <Popover>
          <Popover.Header as="h3">{_("Destructive action")}</Popover.Header>
          <Popover.Body>
            <p>{_("Deleting a site is irreversible and removes all of its content.")}</p>
            <div className="d-flex">
              <Button variant="primary" size="sm" onClick={handleDelete(website)} className="mx-auto">
                {_("Proceed")}
              </Button>
            </div>
          </Popover.Body>
        </Popover>
      }
    >
      <Button variant="outline-warning">
        <i className="bi-trash" />
        &ensp;{_("Delete site")}
      </Button>
    </OverlayTrigger>
  );
};

const WebsiteDetailsDialog = ({ website }) => {
  const dispatch = useDispatch();
  const dialogId = useSelector((state) => state.dialogs.visibleDialogId);
  const visible = dialogId === "websiteDetails";
  const [status, setStatus] = useState("initial");
  const isLoading = status === "loading";

  const hide = () => dispatch(dialogsActions.hideDialogs());

  const haveValuesChanged = (form, website) => {
    return ["name", "language", "region", "domain"].some((field) => form[field].value !== website[field]);
  };

  const handleSubmit = useCallback(
    (website) => (e) => {
      e.preventDefault();
      if (!haveValuesChanged(e.target, website)) {
        hide();
        return;
      }

      setStatus("loading");
      apiService
        .request("update_website", {
          args: { website_id: website.id },
          payload: {
            ...website,
            ...{
              name: e.target.name.value,
              language: e.target.language.value,
              region: e.target.region.value,
              domain: e.target.domain.value,
            },
          },
        })
        .then((data) => {
          setStatus("success");
          dispatch(stashActions.updateWebsite(data));
          hide();
        })
        .catch((err) => {
          setStatus("error");
          dispatch(
            alertsActions.addAlert({
              content: _('Could not update site: "{err}"').supplant({ err: String(err) }),
              severity: "danger",
            }),
          );
          // TODO: notify Sentry
          hide();
        });
    },
    [website, status],
  );

  return !website ? null : (
    <Offcanvas show={visible} onHide={hide} placement="end" aria-labelledby="websiteDetailsLabel">
      <Form onSubmit={handleSubmit(website)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="websiteDetailsLabel">{_("Site Details")}</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <Form.Group className="mb-3">
            <Form.Label>{_("Site name")}</Form.Label>
            <Form.Control
              type="text"
              name="name"
              defaultValue={website.name}
              required
              disabled={isLoading}
              placeholder={_("Site name")}
              autoFocus
              maxLength="255"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{_("Content language")}</Form.Label>
            <Form.Select
              name="language"
              defaultValue={website.language}
              disabled={isLoading}
              aria-label={_("Available languages")}
            >
              {INIT.languages.map(([code, name]) => (
                <option value={code} key={code}>
                  {name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>{_("Audience region")}</Form.Label>
            <Form.Select
              name="region"
              defaultValue={website.region}
              disabled={isLoading}
              aria-label={_("Available regions")}
            >
              {INIT.regions.map(([code, name]) => (
                <option value={code} key={code}>
                  {name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <CollapseArea className="mt-3" title={_("Advanced")}>
            <Form.Group className="mb-3">
              <Form.Label>{_("Your own domain")}</Form.Label>
              <Form.Control
                type="text"
                name="domain"
                defaultValue={website.domain}
                required
                disabled={isLoading}
                placeholder={_("eg. www.joesportfolio.org")}
                autoFocus
                maxLength="255"
              />
            </Form.Group>
            <DeleteWebsite website={website} onSubmit={hide}></DeleteWebsite>
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
  );
};

export default WebsiteDetailsDialog;
