import React, { useRef, useState } from "react";
import { apiService } from "../network";

const ImageUploader = ({ websiteId, onUpload, title }) => {
  const imgPlaceholderRef = useRef(null);
  const [status, setStatus] = useState("initial");
  const isLoading = status === "loading";

  const uploadImage = (formData) => {
    setStatus("loading");
    apiService
      .request("create_image", {
        additionalParams: {
          headers: undefined,
          body: formData,
        },
      })
      .then((image) => {
        setStatus("success");
        onUpload(image);
      })
      .catch((err) => {
        setStatus("error");
        // TODO: notify Sentry
      });
  };

  const onImgSelect = (e) => {
    const data = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const el = imgPlaceholderRef.current;
      if (el) el.style.backgroundImage = `url(${readerEvent.target.result})`;
    };

    reader.readAsDataURL(data);

    const formData = new FormData();

    formData.append("image_file", data);
    formData.append("payload", JSON.stringify({ website_id: websiteId }));

    uploadImage(formData);
  };

  return (
    <label className="image-box image-uploader">
      <input type="file" accept=".jpg" className="visually-hidden" onChange={onImgSelect} />
      <div className="image-box-canvas" ref={imgPlaceholderRef} />
      {isLoading ? (
        <span className="image-uploader-icon">
          <i className="spinner-grow text-primary" role="status" aria-hidden="true" />
        </span>
      ) : (
        <>
          <span className="image-uploader-title">{title}</span>
          <span className="image-uploader-icon">
            <i className="bi-plus-circle-dotted" />
          </span>
        </>
      )}
    </label>
  );
};

export default ImageUploader;
