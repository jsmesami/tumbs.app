import React from "react";
import { useDispatch } from "react-redux";
import { useDebouncedCallback } from "use-debounce";
import { _ } from "../../i18n";
import { actions as stashActions } from "../../slices/stash";
import { defaultDebounceMs } from "../../config";
import ImageUploader from "../ImageUploader";
import ImageEditor from "../ImageEditor";
import RichText from "../RichText";

const Profile = ({ website, widget, updateWidget }) => {
  const dispatch = useDispatch();
  const profileImage = website.images.find((i) => i.id === widget.imageId);
  const colSpacing = "col-6 col-sm-4 col-md-3 col-lg-2 col-xxl-1 mb-4";

  const updateText = useDebouncedCallback((markdown) => {
    updateWidget({ ...widget, text: markdown });
  }, defaultDebounceMs);

  const assignImage = (image) => {
    dispatch(
      stashActions.addImage({
        websiteId: website.id,
        image: image,
      }),
    );
    updateWidget({ ...widget, imageId: image.id });
  };

  return (
    <div className="row">
      <div className={colSpacing}>
        {profileImage ? (
          <ImageEditor image={profileImage} />
        ) : (
          <ImageUploader
            websiteId={website.id}
            onUpload={(images) => assignImage(images[0])}
            title={_("Upload Photo")}
          />
        )}
      </div>
      <div className="col mb-4">
        <RichText value={widget.text} onChange={updateText} />
      </div>
    </div>
  );
};

export default Profile;
