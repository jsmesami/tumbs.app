import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { _ } from "../i18n";
import { apiService } from "../network";
import { actions as alertsActions } from "../slices/alerts";
import { actions as dialogsActions } from "../slices/dialogs";
import { actions as pagesActions } from "../slices/pages";
import { actions as stashActions } from "../slices/stash";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";

const SelectPage = ({ website }) => {
  const dispatch = useDispatch();
  const pageId = useSelector((state) => state.pages.currentId);
  const page = website.pages.find((p) => p.id === pageId);
  const [status, setStatus] = useState("initial");

  const setCurrent = (id) => dispatch(pagesActions.setCurrentId(parseInt(id)));
  const showPageDetailsDialog = () => dispatch(dialogsActions.showDialog("pageDetails"));

  useEffect(() => {
    if (!page && website.pages.length) {
      setCurrent(website.pages[0].id);
    }
  }, [website]);

  const createPage = useCallback(() => {
    setStatus("loading");
    apiService
      .request("create_page", {
        payload: {
          website_id: website.id,
          title: _("Page {pageN}").supplant({ pageN: website.pages.length }),
        },
      })
      .then((page) => {
        setStatus("success");
        dispatch(stashActions.addPage({ websiteId: website.id, page: page }));
        setCurrent(page.id);
      })
      .catch((err) => {
        setStatus("error");
        dispatch(
          alertsActions.addAlert({
            content: _('Could not create page: "{err}"').supplant({ err: String(err) }),
            severity: "danger",
          }),
        );
        // TODO: notify Sentry
      });
  }, [website, status]);

  return (
    <Nav variant="tabs" activeKey={pageId} onSelect={setCurrent}>
      {website.pages.map(({ id, title }) => (
        <Nav.Item key={id}>
          {pageId === id ? (
            <Nav.Link eventKey={id}>
              {title}
              &ensp;
              <i className="bi-gear" title={_("Edit page details")} onClick={showPageDetailsDialog} />
            </Nav.Link>
          ) : (
            <Nav.Link eventKey={id}>{title}</Nav.Link>
          )}
        </Nav.Item>
      ))}

      <Button variant="link" className="ms-auto" title={_("Add page")} onClick={createPage}>
        <i className="bi-plus-circle text-success" />
      </Button>
    </Nav>
  );
};

export default SelectPage;
