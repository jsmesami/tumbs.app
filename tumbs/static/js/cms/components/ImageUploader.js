import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { _ } from "../i18n";
import { apiService } from "../network";
import { imagesUploadChunkSize } from "../config";
import { actions as alertsActions } from "../slices/alerts";

const ImageUploader = ({ websiteId, onUpload, title, multi = false, accept = ".jpg" }) => {
  const dispatch = useDispatch();
  const imgPlaceholderRef = useRef(null);
  const [status, setStatus] = useState("initial");
  const isLoading = status === "loading";
  let uploadResults = [];

  const uploadChunked = ([formSet, ...remaining]) => {
    setStatus("loading");
    Promise.all(
      formSet.map((form) =>
        apiService.request("create_image", {
          additionalParams: {
            headers: undefined,
            body: form,
          },
        }),
      ),
    )
      .then((results) => {
        uploadResults = [...uploadResults, ...results];
        if (remaining.length) {
          uploadChunked(remaining);
        } else {
          setStatus("success");
          onUpload(uploadResults);
        }
      })
      .catch((err) => {
        setStatus("error");
        dispatch(
          alertsActions.addAlert({
            content: _("Could upload images"),
            subContent: err,
            severity: "danger",
          }),
        );
        // TODO: notify Sentry
      });
  };

  const onSelectImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files?.length) return;

    const forms = files.map((file) => {
      if (!multi) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          const el = imgPlaceholderRef.current;
          if (el) el.style.backgroundImage = `url(${readerEvent.target.result})`;
        };
        reader.readAsDataURL(file);
      }
      const formData = new FormData();
      formData.append("image_file", file);
      formData.append("payload", JSON.stringify({ website_id: websiteId }));
      return formData;
    });

    const formSets = [];
    for (let i = 0; i < forms.length; i += imagesUploadChunkSize) {
      formSets.push(forms.slice(i, i + imagesUploadChunkSize));
    }

    uploadChunked(formSets);
  };

  return (
    <label className="image-box image-uploader">
      <input type="file" accept={accept} className="visually-hidden" multiple={multi} onChange={onSelectImages} />
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
