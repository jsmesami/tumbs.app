import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { _ } from "../i18n";
import { actions as alertsActions } from "../slices/alerts";
import { actions as dialogsActions } from "../slices/dialogs";
import { actions as stashActions } from "../slices/stash";
import { apiService } from "../network";
import { INIT } from "../config";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Offcanvas from "react-bootstrap/Offcanvas";

const UpdateWebsiteDialog = ({ website }) => {
  const dispatch = useDispatch();
  const visible = useSelector((state) => state.dialogs.visibleDialogId) === "updateWebsite";
  const [status, setStatus] = useState("not asked");
  const isLoading = status === "loading";

  const hide = () => dispatch(dialogsActions.hideDialogs());

  const haveValuesChanged = (e) => {
    return ["name", "language", "region"].some((field) => e.target[field].value !== website[field]);
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!haveValuesChanged(e)) {
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

  return (
    <Offcanvas show={visible} onHide={hide} placement="end" aria-labelledby="updateWebsiteLabel">
      <Form onSubmit={handleSubmit}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="updateWebsiteLabel">Edit Site</Offcanvas.Title>
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

export default UpdateWebsiteDialog;
