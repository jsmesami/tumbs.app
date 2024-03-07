import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { _ } from "../i18n";
import { actions as alertsActions } from "../slices/alerts";
import { actions as stashActions } from "../slices/stash";
import { apiRequest } from "../network";
import { INIT } from "../config";
import Button from "react-bootstrap/Button";

const CreateWebsiteButton = () => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("initial");
  let isLoading = status === "loading";

  const createWebsite = () => {
    setStatus("loading");
    apiRequest("create_website", {
      payload: {
        name: _("My New Site"),
        language: INIT.currentLanguage,
      },
    })
      .then((website) => {
        return apiRequest("create_page", {
          payload: {
            website_id: website.id,
            title: _("Homepage"),
          },
        }).then((page) => {
          website.pages = [page];
          setStatus("success");
          dispatch(stashActions.addWebsite(website));
          dispatch(stashActions.setCurrentWebsite(website.id));
        });
      })
      .catch((err) => {
        setStatus("error");
        dispatch(
          alertsActions.addAlert({
            content: _('Could not create site: "{err}"').supplant({ err: String(err) }),
            severity: "danger",
          }),
        );
        // TODO: notify Sentry
      });
  };

  return (
    <Button variant="outline-primary" disabled={isLoading} onClick={createWebsite}>
      {isLoading ? (
        <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" />
      ) : (
        <span className="bi bi-plus-circle" aria-hidden="true" />
      )}
      &ensp;
      <span>{_("Create Site")}</span>
    </Button>
  );
};

export default CreateWebsiteButton;
