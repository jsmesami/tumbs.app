import React from "react";
import { useDispatch } from "react-redux";
import { useDebouncedCallback } from "use-debounce";
import { _ } from "../../i18n";
import { actions as stashActions } from "../../slices/stash";
import { defaultDebounceMs } from "../../config";
import ImageThumbnail from "../ImageThumbnail";
import ImageToolbar from "../ImageToolbar";
import ImageUploader from "../ImageUploader";
import RichText from "../RichText";

const Profile = ({ website, widget, updateWidget }) => {
  const dispatch = useDispatch();
  const profileImage = website.images.find((i) => i.id === widget.imageId);

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
    <div className="widget widget-profile">
      {profileImage ? (
        <ImageThumbnail image={profileImage}>
          <ImageToolbar features={["Edit", "Remove"]} />
        </ImageThumbnail>
      ) : (
        <ImageUploader
          websiteId={website.id}
          onUpload={(images) => assignImage(images[0])}
          title={_("Upload Photo")}
        />
      )}

      <RichText value={widget.text} onChange={updateText} />
    </div>
  );
};

export default Profile;
