import React from "react";
import * as R from "ramda";
import { useDispatch, useSelector } from "react-redux";
import { actions as alertsActions } from "../slices/alerts";
import Alert from "react-bootstrap/Alert";

const Alerts = () => {
  const dispatch = useDispatch();
  const alerts = useSelector((state) => state.alerts.list);
  const dismiss = (id) => dispatch(alertsActions.removeAlert(id));

  return (
    <div className="alerts row container-md">
      {R.reverse(alerts).map(({ id, content, severity }) => (
        <Alert key={id} variant={severity} dismissible onClose={() => dismiss(id)}>
          {content}
        </Alert>
      ))}
    </div>
  );
};

export default Alerts;