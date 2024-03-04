import React from "react";
import { useSelector } from "react-redux";
import Alerts from "./components/Alerts";
import CreateWebsiteButton from "./components/CreateWebsiteButton";
import UpdateWebsiteModal from "./components/UpdateWebsiteModal";
import WebsiteTopBar from "./components/WebsiteTopBar";

const App = () => {
  const currentWebsite = useSelector((state) => state.websites.current);

  return (
    <>
      <Alerts />
      {currentWebsite ? (
        <>
          <WebsiteTopBar website={currentWebsite} />
          <UpdateWebsiteModal website={currentWebsite} />
        </>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center my-4">
          <h4>No site yet</h4>
          <CreateWebsiteButton />
        </div>
      )}
    </>
  );
};

export default App;
