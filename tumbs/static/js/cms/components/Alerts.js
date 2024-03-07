import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions as alertsActions } from "../slices/alerts";
import Alert from "react-bootstrap/Alert";

const Alerts = () => {
  const dispatch = useDispatch();
  const alerts = useSelector((state) => state.alerts.all);
  const dismiss = (id) => dispatch(alertsActions.removeAlert(id));

  return (
    <div className="alerts row container-md">
      {[...alerts].reverse().map(({ id, content, severity }) => (
        <Alert key={id} variant={severity} dismissible onClose={() => dismiss(id)}>
          {content}
        </Alert>
      ))}
    </div>
  );
};

export default Alerts;
