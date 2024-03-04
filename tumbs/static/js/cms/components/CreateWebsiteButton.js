import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { actions as websitesActions } from "../slices/websites";
import { actions as alertsActions } from "../slices/alerts";
import { apiRequest } from "../network";
import Button from "react-bootstrap/Button";

const CreateWebsiteButton = () => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("initial");
  let isLoading = status === "loading";

  const createWebsite = () => {
    setStatus("loading");
    apiRequest("create_website", {
      payload: {
        name: "My New Site",
      },
    })
      .then((website) => {
        console.log(website);
        return apiRequest("create_page", {
          payload: {
            website_id: website.id,
            title: "Homepage",
          },
        }).then((page) => {
          website.pages = [page];
          setStatus("success");
          dispatch(websitesActions.addWebsite(website));
          dispatch(websitesActions.setCurrent(website.id));
        });
      })
      .catch((err) => {
        setStatus("error");
        dispatch(alertsActions.addAlert({ content: `Could not create site: ${err}`, severity: "danger" }));
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
      <span>Create Site</span>
    </Button>
  );
};

export default CreateWebsiteButton;
