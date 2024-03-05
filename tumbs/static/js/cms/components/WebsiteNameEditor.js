import React, { useState } from "react";
import * as R from "ramda";
import { useDispatch } from "react-redux";
import { _, interpolate } from "../i18n";
import { actions as websitesActions } from "../slices/websites";
import { actions as alertsActions } from "../slices/alerts";
import { apiRequest } from "../network";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";

const WebsiteNameEditor = ({ website }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("initial");
  let isLoading = status === "loading";
  let isEditing = ["editing", "loading"].includes(status);

  const startEditing = () => setStatus("editing");
  const stopEditing = () => setStatus("initial");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");

    apiRequest("update_website", {
      payload: R.assoc("name", e.target.name.value, website),
      args: { website_id: website.id },
    })
      .then((data) => {
        setStatus("success");
        dispatch(websitesActions.updateWebsite(data));
      })
      .catch((err) => {
        setStatus("error");
        dispatch(
          alertsActions.addAlert({ content: interpolate(_("Could not update site: %s"), err), severity: "danger" }),
        );
        // TODO: notify Sentry
      });
  };

  return (
    <>
      {isEditing ? (
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Form.Control
              name="name"
              defaultValue={website.name}
              disabled={isLoading}
              autoFocus
              placeholder={_("Site name")}
              aria-label={_("Site name")}
            />
            <Button variant="outline-secondary" disabled={isLoading} onClick={stopEditing} title={_("Cancel")}>
              <i className="bi-x-circle" />
            </Button>
            <Button
              variant="outline-secondary"
              type="submit"
              disabled={isLoading}
              title={isLoading ? _("Saving") : _("Save changes")}
            >
              {isLoading ? <i className="spinner-grow spinner-grow-sm" /> : <i className="bi-floppy text-success" />}
            </Button>
          </InputGroup>
        </Form>
      ) : (
        <>
          <h3>{website.name}</h3>
          <Button
            variant="light"
            onClick={startEditing}
            className="button-icon button-start-editing"
            title={_("Edit title")}
          >
            <i className="bi-pencil" />
          </Button>
        </>
      )}
    </>
  );
};

export default WebsiteNameEditor;
