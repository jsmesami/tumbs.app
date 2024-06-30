import React from "react";

const ImageThumbnail = ({ image, children }) => {
  return (
    <div className="image-box">
      <div className="image-box-canvas" style={{ backgroundImage: `url(${image.file})` }} />
      {children}
    </div>
  );
};

export default ImageThumbnail;
