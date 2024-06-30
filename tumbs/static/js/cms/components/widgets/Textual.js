import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultDebounceMs } from "../../config";
import RichText from "../RichText";

const Textual = ({ widget, updateWidget }) => {
  const updateText = useDebouncedCallback((markdown) => {
    updateWidget({ ...widget, text: markdown });
  }, defaultDebounceMs);

  return (
    <div className="widget widget-textual">
      <RichText value={widget.text} onChange={updateText} />
    </div>
  );
};

export default Textual;
