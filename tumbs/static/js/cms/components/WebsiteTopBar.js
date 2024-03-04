import React from "react";
import { useDispatch } from "react-redux";
import { actions as updateWebsiteActions } from "../slices/updateWebsiteModal";
import WebsiteNameEditor from "./WebsiteNameEditor";
import Button from "react-bootstrap/Button";

const WebsiteTopBar = ({ website }) => {
  const dispatch = useDispatch();
  const showUpdateWebsiteModal = () => dispatch(updateWebsiteActions.showModal());

  return (
    <div className="website-top-bar">
      <WebsiteNameEditor website={website} />
      <Button variant="light" className="button-icon button-settings" onClick={showUpdateWebsiteModal}>
        <i className="bi-gear"></i>
      </Button>
      <Button variant="outline-primary">Preview</Button>
    </div>
  );
};

export default WebsiteTopBar;
