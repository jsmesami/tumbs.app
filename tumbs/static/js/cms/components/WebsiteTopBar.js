import React from "react";
import { useDispatch } from "react-redux";
import { _ } from "../i18n";
import { actions as dialogsActions } from "../slices/dialogs";
import WebsiteNameEditor from "./WebsiteNameEditor";
import { Button } from "react-bootstrap";

const WebsiteTopBar = ({ website }) => {
  const dispatch = useDispatch();
  const showWebsiteDetailsDialog = () => dispatch(dialogsActions.showDialog("websiteDetails"));

  return (
    <div className="website-top-bar">
      <WebsiteNameEditor website={website} />
      <Button variant="link" className="ms-auto" title={_("Edit site details")} onClick={showWebsiteDetailsDialog}>
        <i className="bi-gear"></i>
      </Button>
      <Button variant="outline-primary">{_("Preview")}</Button>
    </div>
  );
};

export default WebsiteTopBar;
