import React from "react";
import { useDispatch } from "react-redux";
import { _ } from "../../i18n";
import { actions as stashActions } from "../../slices/stash";
import ImageUploader from "../ImageUploader";
import ImageEditor from "../ImageEditor";

const Gallery = ({ website, widget, updateWidget }) => {
  const dispatch = useDispatch();
  const imageIds = widget.imageIds || [];
  const gallery = website.images.filter((i) => imageIds.includes(i.id));
  const colSpacing = "col-6 col-sm-4 col-md-3 col-lg-2 col-xxl-1 mb-4";

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
    <div className="row">
      {gallery.map((image) => (
        <div className={colSpacing} key={image.id}>
          <ImageEditor image={image} />
        </div>
      ))}
      <div className={colSpacing}>
        <ImageUploader websiteId={website.id} onUpload={appendImages} multi title={_("Upload images")} />
      </div>
    </div>
  );
};

export default Gallery;
