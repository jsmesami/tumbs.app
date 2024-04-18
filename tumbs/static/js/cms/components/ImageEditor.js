import React from "react";

const ImageEditor = ({ image }) => {
  return (
    <div className="image-box image-editor">
      <div className="image-box-canvas" style={{ backgroundImage: `url(${image.file})` }} />
    </div>
  );
};

export default ImageEditor;
