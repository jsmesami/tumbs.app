import React, { useState } from "react";
import { Collapse } from "react-bootstrap";

const CollapseArea = ({ title, children, ...rest }) => {
  const [open, setOpen] = useState(false);
  const handleToggle = (e) => {
    e.preventDefault();
    setOpen(!open);
  };

  return (
    <div {...rest}>
      <a
        className={`collapse-control ${open ? "" : "collapsed"}`}
        href="#"
        onClick={handleToggle}
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
