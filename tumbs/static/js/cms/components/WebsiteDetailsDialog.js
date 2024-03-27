import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { _ } from "../i18n";
import { actions as alertsActions } from "../slices/alerts";
import { actions as dialogsActions } from "../slices/dialogs";
import { actions as stashActions } from "../slices/stash";
import { apiService } from "../network";
import { autoDismissMs, INIT } from "../config";
import CollapseArea from "./CollapseArea";
import DeleteDialog from "./DeleteDialog";
import SeoBadge from "./SeoBadge";
import { Button, Form, Offcanvas } from "react-bootstrap";

const DeleteWebsite = ({ disabled, handleDelete }) => {
  return (
    <DeleteDialog
      body={_("Deleting a site is irreversible and removes all of its content.")}
      placement="top"
      disabled={disabled}
      handleDelete={handleDelete}
    >
      <Button variant="outline-warning" disabled={disabled}>
        <i className="bi-trash" />
        &ensp;{_("Delete site")}
      </Button>
    </DeleteDialog>
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
              content: _("Could not update site"),
              subContent: err,
              severity: "danger",
            }),
          );
          hide();
          // TODO: notify Sentry
        });
    },
    [website],
  );

  const handleDelete = useCallback(
    (website) => () => {
      setStatus("loading");
      apiService
        .request("delete_website", {
          args: { website_id: website.id },
        })
        .then(() => {
          setStatus("success");
          dispatch(
            alertsActions.addAlert({
              content: _('Site "{name}" has been successfully deleted.').supplant({ name: website.name }),
              severity: "success",
              autoDismissMs: autoDismissMs,
            }),
          );
          dispatch(stashActions.deleteWebsite({ websiteId: website.id }));
          hide();
        })
        .catch((err) => {
          setStatus("error");
          dispatch(
            alertsActions.addAlert({
              content: _('Could not delete site "{name}"').supplant({ name: website.name }),
              subContent: err,
              severity: "danger",
            }),
          );
          hide();
          // TODO: notify Sentry
        });
    },
    [website],
  );

  return (
    website && (
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
              <Form.Label>
                {_("Content language")} <SeoBadge />
              </Form.Label>
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
                  disabled={isLoading}
                  placeholder={_("eg. www.janesportfolio.org")}
                  autoFocus
                  maxLength="255"
                />
              </Form.Group>
              <DeleteWebsite disabled={isLoading} handleDelete={handleDelete(website)} />
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

export default WebsiteDetailsDialog;
