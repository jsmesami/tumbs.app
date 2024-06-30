import React from "react";
import { useDispatch } from "react-redux";
import { _ } from "../../i18n";
import { actions as stashActions } from "../../slices/stash";
import ImageUploader from "../ImageUploader";
import ImageThumbnail from "../ImageThumbnail";
import ImageToolbar from "../ImageToolbar";

const Gallery = ({ website, widget, updateWidget }) => {
  const dispatch = useDispatch();
  const imageIds = widget.imageIds || [];
  const gallery = website.images.filter((i) => imageIds.includes(i.id));
  const galleryLen = gallery.length;

  const appendImages = (images) => {
    dispatch(
      stashActions.addImages({
        websiteId: website.id,
        images: images,
      }),
    );
    updateWidget({ ...widget, imageIds: [...imageIds, ...images.map((i) => i.id)] });
  };

  return (
    <div className="widget widget-gallery">
      {gallery.map((image, index) => (
        <ImageThumbnail image={image} key={index}>
          <ImageToolbar
            features={[index > 0 && "ShiftLeft", index < galleryLen - 1 && "ShiftRight", "Edit", "Remove"]}
          />
        </ImageThumbnail>
      ))}
      <div>
        <ImageUploader websiteId={website.id} onUpload={appendImages} multi title={_("Upload images")} />
      </div>
    </div>
  );
};

export default Gallery;
