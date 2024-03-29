import React, { useState } from "react";
import { _ } from "../i18n";
import { Button, CloseButton, OverlayTrigger, Popover } from "react-bootstrap";

const DeleteDialog = ({ body, placement, disabled, handleDelete, children }) => {
  const [show, setShow] = useState(false);

  const handleHide = () => {
    setShow(false);
  };

  const doDelete = () => {
    handleDelete();
    setShow(false);
  };

  return (
    <OverlayTrigger
      trigger="click"
      placement={placement || "top"}
      show={show}
      onToggle={() => setShow(!show)}
      overlay={
        <Popover>
          <Popover.Header as="h3" className="d-flex align-items-center">
            <i className="bi-exclamation-triangle-fill text-danger" />
            &ensp;
            {_("Destructive action")}
            <CloseButton className="ms-auto" title={_("Close")} onClick={handleHide} />
          </Popover.Header>
          <Popover.Body>
            <p>{body}</p>
            <div className="d-flex">
              <Button variant="primary" size="sm" onClick={doDelete} className="mx-auto" disabled={disabled}>
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
