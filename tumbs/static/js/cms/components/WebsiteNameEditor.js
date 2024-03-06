import React, { useState } from "react";
import * as R from "ramda";
import { useDispatch } from "react-redux";
import { _ } from "../i18n";
import { actions as websitesActions } from "../slices/websites";
import { actions as alertsActions } from "../slices/alerts";
import { apiRequest } from "../network";
import { EditText } from "react-edit-text";

const WebsiteNameEditor = ({ website }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("initial");
  let isLoading = status === "loading";

  const handleSubmit = ({ value, previousValue }) => {
    if (value === previousValue) return;

    setStatus("loading");

    apiRequest("update_website", {
      payload: R.assoc("name", value, website),
      args: { website_id: website.id },
    })
      .then((data) => {
        setStatus("success");
        dispatch(websitesActions.updateWebsite(data));
      })
      .catch((err) => {
        setStatus("error");
        dispatch(
          alertsActions.addAlert({
            content: _('Could not update site: "{err}"').supplant({ err: String(err) }),
            severity: "danger",
          }),
        );
        // TODO: notify Sentry
      });
  };

  return (
    <EditText
      defaultValue={website.name}
      name="name"
      onSave={handleSubmit}
      readonly={isLoading}
      className="h3 content-editable"
    />
  );
};

export default WebsiteNameEditor;
