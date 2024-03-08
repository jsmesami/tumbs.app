import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { _ } from "../i18n";
import { actions as alertsActions } from "../slices/alerts";
import { actions as stashActions } from "../slices/stash";
import { apiService } from "../network";
import { EditText } from "react-edit-text";

const WebsiteNameEditor = ({ website }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("initial");
  let isLoading = status === "loading";
  let isEditing = ["editing", "loading"].includes(status);

  const startEditing = () => setStatus("editing");
  const stopEditing = () => setStatus("initial");

  const handleSubmit = ({ value, previousValue }) => {
    if (value === previousValue) return;

    setStatus("loading");

    apiService
      .request("update_website", {
        payload: { ...website, ...{ name: value } },
        args: { website_id: website.id },
      })
      .then((data) => {
        setStatus("success");
        dispatch(stashActions.updateWebsite(data));
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
    <div className="inline-editable">
      <EditText
        defaultValue={website.name}
        name="name"
        onSave={handleSubmit}
        readonly={isLoading}
        className="h3 inline-editable"
        inputClassName="inline-editable-input"
        onEditMode={startEditing}
        onBlur={stopEditing}
      />
      {isEditing ? null : <i className="edit-icon bi-pencil-square" />}
    </div>
  );
};

export default WebsiteNameEditor;
