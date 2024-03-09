import React from "react";
import { useSelector } from "react-redux";
import { selectors as stashSelectors } from "./slices/stash";
import { _ } from "./i18n";
import Alerts from "./components/Alerts";
import CreateWebsiteButton from "./components/CreateWebsiteButton";
import SelectPage from "./components/SelectPage";
import UpdateWebsiteDialog from "./components/UpdateWebsiteDialog";
import WebsiteTopBar from "./components/WebsiteTopBar";

const App = () => {
  const currentWebsite = useSelector(stashSelectors.selectCurrentWebsite);

  return (
    <>
      <Alerts />
      {currentWebsite ? (
        <>
          <WebsiteTopBar website={currentWebsite} />
          <SelectPage website={currentWebsite} />
          <UpdateWebsiteDialog website={currentWebsite} />
        </>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center my-4">
          <h4>{_("No site yet")}</h4>
          <CreateWebsiteButton />
        </div>
      )}
    </>
  );
};

export default App;
