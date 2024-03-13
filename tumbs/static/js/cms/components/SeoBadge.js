import React from "react";
import { _ } from "../i18n";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const SeoBadge = () => (
  <OverlayTrigger
    key="top"
    placement="top"
    overlay={<Tooltip>{_("Important for search engines optimization")}</Tooltip>}
  >
    <span className="badge rounded-pill badge-seo">SEO</span>
  </OverlayTrigger>
);

export default SeoBadge;
