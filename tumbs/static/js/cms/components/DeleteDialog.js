import React from "react";
import { _ } from "../i18n";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";

const DeleteDialog = ({ body, placement, disabled, handleDelete, children }) => {
  return (
    <OverlayTrigger
      trigger="click"
      placement={placement || "top"}
      overlay={
        <Popover>
          <Popover.Header as="h3">
            <i className="bi-exclamation-triangle-fill text-danger" />
            &ensp;
            {_("Destructive action")}
          </Popover.Header>
          <Popover.Body>
            <p>{body}</p>
            <div className="d-flex">
              <Button variant="primary" size="sm" onClick={handleDelete} className="mx-auto" disabled={disabled}>
                {_("Proceed")}
              </Button>
            </div>
          </Popover.Body>
        </Popover>
      }
    >
      {children}
    </OverlayTrigger>
  );
};

export default DeleteDialog;
