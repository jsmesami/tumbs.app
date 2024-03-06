import React from "react";
import { useDispatch } from "react-redux";
import { _ } from "../i18n";
import { actions as updateWebsiteActions } from "../slices/updateWebsiteDialog";
import WebsiteNameEditor from "./WebsiteNameEditor";
import Button from "react-bootstrap/Button";

const WebsiteTopBar = ({ website }) => {
  const dispatch = useDispatch();
  const showUpdateWebsiteDialog = () => dispatch(updateWebsiteActions.show());

  return (
    <div className="website-top-bar">
      <WebsiteNameEditor website={website} />
      <Button variant="light" className="button-icon button-settings" onClick={showUpdateWebsiteDialog}>
        <i className="bi-gear"></i>
      </Button>
      <Button variant="outline-primary">{_("Preview")}</Button>
    </div>
  );
};

export default WebsiteTopBar;
