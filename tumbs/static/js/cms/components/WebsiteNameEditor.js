import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { _ } from "../i18n";
import { actions as alertsActions } from "../slices/alerts";
import { actions as stashActions } from "../slices/stash";
import { apiService } from "../network";
import { EditText } from "react-edit-text";

const WebsiteNameEditor = ({ website }) => {
  const dispatch = useDispatch();
  const [editor, setEditor] = useState("initial");
  const [status, setStatus] = useState("initial");
  const isLoading = status === "loading";
  const isBusy = editor === "editing" || isLoading;

  const startEditing = () => setEditor("editing");
  const stopEditing = () => setEditor("initial");

  const handleSubmit = ({ value, previousValue }) => {
    if (value === previousValue) return;

    setStatus("loading");

    apiService
      .request("update_website", {
        args: { website_id: website.id },
        payload: { ...website, ...{ name: value } },
      })
      .then((data) => {
        setStatus("success");
        dispatch(stashActions.updateWebsite(data));
      })
      .catch((err) => {
        setStatus("error");
        dispatch(
          alertsActions.addAlert({
            content: _('Could not update site: "{err}"').supplant({ err: err }),
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
        readonly={status === "loading"}
        className="h3 inline-editable"
        inputClassName="inline-editable-input"
        onEditMode={startEditing}
        onBlur={stopEditing}
      />
      {!isBusy && <i className="edit-icon bi-pencil-square" />}
    </div>
  );
};

export default WebsiteNameEditor;
