import React from "react";

const ShiftLeft = () => {
  return (
    <button className="btn btn-light btn-shift-left btn-sm">
      <i className="bi bi-arrow-left" />
    </button>
  );
};

const ShiftRight = () => {
  return (
    <button className="btn btn-light btn-shift-right">
      <i className="bi bi-arrow-right" />
    </button>
  );
};

const Edit = () => {
  return (
    <button className="btn btn-light btn-shift-left btn-sm ms-auto">
      <i className="bi bi-pencil" />
    </button>
  );
};

const Remove = () => {
  return (
    <button className="btn btn-light btn-shift-right">
      <i className="bi bi-trash" />
    </button>
  );
};

const ImageToolbar = ({ features }) => {
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
