import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions as alertsActions } from "../slices/alerts";
import { actions as newWebsiteActions } from "../slices/newWebsiteModal";
import { actions as websitesActions } from "../slices/websites";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { request } from "../network";
import { LANGUAGES, REGIONS } from "../store";

const NewWebsiteModal = () => {
  const dispatch = useDispatch();
  const modalVisible = useSelector((state) => state.newWebsiteModal.visible);
  const [status, setStatus] = useState("not asked");
  let isLoading = status === "loading";
  let defaultLanguage = (navigator.language || "en").slice(0, 2);

  const hideModal = () => dispatch(newWebsiteActions.hideModal());

  const handleSubmit = (e) => {
    setStatus("loading");

    request("create_website", {
      payload: {
        name: e.target.name.value,
        language: e.target.language.value,
        region: e.target.region.value,
      },
      onSuccess: (data) => {
        setStatus("success");
        dispatch(websitesActions.addWebsite(data));
        dispatch(websitesActions.setCurrent(data.id));
        hideModal();
      },
      onError: (err) => {
        setStatus("error");
        dispatch(alertsActions.addAlert({ content: `Could not add website: ${err}`, severity: "danger" }));
        // TODO: notify Sentry
        hideModal();
      },
    });
    e.preventDefault();
  };

  return (
    <Modal show={modalVisible} onHide={hideModal} fullscreen="md-down">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Create Site</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Site name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              required
              disabled={isLoading}
              placeholder="New site name"
              autoFocus
              maxLength="255"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Language</Form.Label>
            <Form.Select
              name="language"
              defaultValue={defaultLanguage}
              disabled={isLoading}
              aria-label="Available languages"
            >
              {LANGUAGES.map(([code, name]) => (
                <option value={code} key={code}>
                  {name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Region</Form.Label>
            <Form.Select name="region" defaultValue="eu" disabled={isLoading} aria-label="Available regions">
              {REGIONS.map(([code, name]) => (
                <option value={code} key={code}>
                  {name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" disabled={isLoading} onClick={hideModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" /> Saving
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default NewWebsiteModal;
