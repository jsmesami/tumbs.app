import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { _ } from "../i18n";
import { apiService } from "../network";
import { actions as alertsActions } from "../slices/alerts";
import { actions as stashActions } from "../slices/stash";

const SelectPage = ({ website }) => {
  const dispatch = useDispatch();
  const [current, setCurrent] = useState(0);
  const [status, setStatus] = useState("initial");

  useEffect(() => {
    if (current < 1 && website.pages.length) {
      setCurrent(website.pages[0].id);
    }
  }, [website, current]);

  const tabDispatcher = (id) => {
    return (e) => {
      e.stopPropagation();
      setCurrent(id);
    };
  };

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
    <ul className="nav nav-tabs">
      {website.pages.map(({ id, title }) => {
        return (
          <li className="nav-item" key={id} onClick={tabDispatcher(id)}>
            <a className={`nav-link ${current === id ? "active" : ""}`} href="#">
              {title}
            </a>
          </li>
        );
      })}
      <li className="nav-item">
        <button className="nav-link" onClick={createPage}>
          <i className="bi-plus-circle text-success" />
        </button>
      </li>
    </ul>
  );
};

export default SelectPage;
