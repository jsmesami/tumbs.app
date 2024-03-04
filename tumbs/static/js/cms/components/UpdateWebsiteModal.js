import React, { useState } from "react";
import * as R from "ramda";
import { useSelector, useDispatch } from "react-redux";
import { actions as alertsActions } from "../slices/alerts";
import { actions as updateWebsiteActions } from "../slices/updateWebsiteModal";
import { actions as websitesActions } from "../slices/websites";
import { apiRequest } from "../network";
import { LANGUAGES, REGIONS } from "../store";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

const UpdateWebsiteModal = ({ website }) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector((state) => state.updateWebsiteModal.visible);
  const [status, setStatus] = useState("not asked");
  let isLoading = status === "loading";

  const hideModal = () => dispatch(updateWebsiteActions.hideModal());

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");

    apiRequest("update_website", {
      payload: R.mergeRight(website, {
        name: e.target.name.value,
        language: e.target.language.value,
        region: e.target.region.value,
      }),
      args: { website_id: website.id },
    })
      .then((data) => {
        setStatus("success");
        dispatch(websitesActions.updateWebsite(data));
        hideModal();
      })
      .catch((err) => {
        setStatus("error");
        dispatch(alertsActions.addAlert({ content: `Could not update website: ${err}`, severity: "danger" }));
        // TODO: notify Sentry
        hideModal();
      });
  };

  return (
    <Modal show={modalVisible} onHide={hideModal} fullscreen="md-down">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Site</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Site name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              defaultValue={website.name}
              required
              disabled={isLoading}
              placeholder="Site name"
              autoFocus
              maxLength="255"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Language</Form.Label>
            <Form.Select
              name="language"
              defaultValue={website.language}
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
            <Form.Select
              name="region"
              defaultValue={website.region}
              disabled={isLoading}
              aria-label="Available regions"
            >
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

export default UpdateWebsiteModal;
