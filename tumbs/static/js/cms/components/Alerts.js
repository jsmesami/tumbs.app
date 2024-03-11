import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions as alertsActions } from "../slices/alerts";
import Alert from "react-bootstrap/Alert";

const AlertWrapper = ({ id, severity, autoDismissMs, children }) => {
  const dispatch = useDispatch();
  const dismiss = (id) => () => dispatch(alertsActions.removeAlert(id));

  useEffect(() => {
    if (autoDismissMs) {
      const timeoutId = setTimeout(dismiss(id), autoDismissMs);
      // Cleanup function to clear the timeout if the component unmounts
      return () => clearTimeout(timeoutId);
    }
  }, []);

  return (
    <Alert variant={severity} dismissible onClose={dismiss(id)}>
      {children}
    </Alert>
  );
};

const Alerts = () => {
  const alerts = useSelector((state) => state.alerts.all);

  return (
    <div className="alerts row container-md">
      {[...alerts].reverse().map(({ content, ...alert }) => (
        <AlertWrapper key={alert.id} {...alert}>
          {content}
        </AlertWrapper>
      ))}
    </div>
  );
};

export default Alerts;
