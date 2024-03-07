import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectors as stashSelectors } from "../slices/stash";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

const PageEditor = ({ website }) => {
  const pages = useSelector(stashSelectors.selectPages);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(pages[0].id);
  }, [pages]);

  return (
    <Tabs id="controlled-tab-example" activeKey={active} onSelect={setActive} className="mb-3">
      {pages.map(({ id, title }) => {
        return (
          <Tab key={id} eventKey={id} title={title}>
            <div className="container-fluid">Some content</div>
          </Tab>
        );
      })}
    </Tabs>
  );
};

export default PageEditor;
