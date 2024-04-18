import React from "react";
import { useDispatch } from "react-redux";
import { useDebouncedCallback } from "use-debounce";
import { defaultDebounceMs } from "../../config";
import { _ } from "../../i18n";
import { actions as stashActions } from "../../slices/stash";
import ImageUploader from "../ImageUploader";
import ImageEditor from "../ImageEditor";
import RichText from "../RichText";

const Profile = ({ website, widget, updateWidget }) => {
  const dispatch = useDispatch();
  const profileImage = website.images.find((i) => i.id === widget.imageId);

  const updateText = useDebouncedCallback((markdown) => {
    updateWidget({ ...widget, text: markdown });
  }, defaultDebounceMs);

  const assignImage = (image) => {
    dispatch(
      stashActions.updateWebsite({
        ...website,
        images: [...website.images, image],
      }),
    );
    updateWidget({ ...widget, imageId: image.id });
  };

  return (
    <div className="row">
      <div className="col-2">
        {profileImage ? (
          <ImageEditor image={profileImage} />
        ) : (
          <ImageUploader websiteId={website.id} onUpload={assignImage} title={_("New Photo")} />
        )}
      </div>
      <div className="col">
        <RichText value={widget.text} onChange={updateText} />
      </div>
    </div>
  );
};

export default Profile;
