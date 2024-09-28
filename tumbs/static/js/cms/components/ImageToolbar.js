import React from "react";
import { _ } from "../i18n";
import { apiService } from "../network";
import { actions as alertsActions } from "../slices/alerts";
import { actions as stashActions } from "../slices/stash";
import { useDispatch } from "react-redux";

const ShiftLeft = () => {
  return (
    <button className="btn btn-light btn-shift-left btn-sm" title={_("Shift left")}>
      <i className="bi bi-arrow-left" />
    </button>
  );
};

const ShiftRight = () => {
  return (
    <button className="btn btn-light btn-shift-right" title={_("Shift right")}>
      <i className="bi bi-arrow-right" />
    </button>
  );
};

const Edit = () => {
  return (
    <button className="btn btn-light btn-shift-left btn-sm ms-auto" title={_("Edit")}>
      <i className="bi bi-pencil" />
    </button>
  );
};

const Remove = () => {
  return (
    <button className="btn btn-light btn-shift-right" title={_("Remove")}>
      <i className="bi bi-trash" />
    </button>
  );
};

const ImageToolbar = ({ features }) => {
  const dispatch = useDispatch();
  const syncPageContent = (website, oldPage, newPage) => {
    apiService
      .request("update_page", {
        args: { page_id: newPage.id },
        payload: { content: newPage.content },
      })
      .catch((err) => {
        dispatch(
          alertsActions.addAlert({
            content: _("Could not update page content"),
            subContent: err,
            severity: "danger",
          }),
        );
        dispatch(
          stashActions.updatePage({
            websiteId: website.id,
            page: oldPage,
          }),
        );
        // TODO: notify Sentry
      });
  };

  const shiftLeft = (page) => () => {};

  return (
    <div className="image-toolbar">
      {features.includes("ShiftLeft") && <ShiftLeft />}
      {features.includes("ShiftRight") && <ShiftRight />}
      {features.includes("Edit") && <Edit />}
      {features.includes("Remove") && <Remove />}
    </div>
  );
};

export default ImageToolbar;
