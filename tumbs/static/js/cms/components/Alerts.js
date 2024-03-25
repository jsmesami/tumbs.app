import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { _ } from "../i18n";
import { actions as alertsActions } from "../slices/alerts";
import { Toast, ToastContainer } from "react-bootstrap";

const Alerts = () => {
  const dispatch = useDispatch();
  const alerts = useSelector((state) => state.alerts.all);
  const severityToHeader = {
    success: _("Success"),
    danger: _("Error"),
  };

  const handleClose = (id) => () => {
    dispatch(alertsActions.removeAlert(id));
  };

  return (
    <ToastContainer position="bottom-start" className="p-3">
      {[...alerts].reverse().map(({ id, content, subContent, severity, autoDismissMs }) => (
        <Toast bg={severity} key={id} onClose={handleClose(id)} delay={autoDismissMs} autohide={autoDismissMs}>
          <Toast.Header>
            <strong>{severityToHeader[severity]}</strong>
          </Toast.Header>
          <Toast.Body>
            <div className="text-white">{content}</div>
            <div className="text-white-50">
              <small>{subContent}</small>
            </div>
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default Alerts;
