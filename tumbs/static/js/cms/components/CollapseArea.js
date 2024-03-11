import React, { useState } from "react";
import Collapse from "react-bootstrap/Collapse";

const CollapseArea = ({ title, children, ...rest }) => {
  const [open, setOpen] = useState(false);
  return (
    <div {...rest}>
      <a
        className={`collapse-control ${open ? "" : "collapsed"}`}
        href="#"
        onClick={() => setOpen(!open)}
        aria-controls="collapse-content"
        aria-expanded={open}
      >
        {open ? <i className="bi-caret-down-fill" /> : <i className="bi-caret-right-fill" />}
        {title}
        <hr />
      </a>
      <Collapse in={open}>
        <div id="collapse-content">{children}</div>
      </Collapse>
    </div>
  );
};

export default CollapseArea;
