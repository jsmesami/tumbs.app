import React from "react";
import { useDispatch } from "react-redux";
import { actions as newWebsiteActions } from "../slices/newWebsiteModal";
import Button from "react-bootstrap/Button";
import Alerts from "./Alerts";
import NewWebsiteModal from "./NewWebsiteModal";
import SelectWebsite from "./SelectWebsite";

const App = () => {
  const dispatch = useDispatch();
  const showNewWebsiteModal = () => dispatch(newWebsiteActions.showModal());

  return (
    <>
      <Alerts />
      <SelectWebsite />
      <Button variant="primary" onClick={showNewWebsiteModal}>
        Create site
      </Button>
      <NewWebsiteModal />
    </>
  );
};

export default App;
