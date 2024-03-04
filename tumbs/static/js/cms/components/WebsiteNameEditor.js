import React, { useState } from "react";
import * as R from "ramda";
import { useDispatch } from "react-redux";
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
        dispatch(alertsActions.addAlert({ content: `Could not update website: ${err}`, severity: "danger" }));
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
              placeholder="Site name"
              aria-label="Site name"
            />
            <Button variant="outline-secondary" disabled={isLoading} onClick={stopEditing}>
              <i className="bi-x-circle" />
            </Button>
            <Button variant="outline-secondary" type="submit" disabled={isLoading}>
              {isLoading ? <i className="spinner-grow spinner-grow-sm" /> : <i className="bi-floppy text-success" />}
            </Button>
          </InputGroup>
        </Form>
      ) : (
        <>
          <h3>{website.name}</h3>
          <Button variant="light" onClick={startEditing} className="button-icon button-start-editing">
            <i className="bi-pencil" />
          </Button>
        </>
      )}
    </>
  );
};

export default WebsiteNameEditor;
