import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultDebounceMs } from "../../config";
import RichText from "../RichText";

const Textual = ({ widget, updateWidget }) => {
  const updateText = useDebouncedCallback((markdown) => {
    updateWidget({ ...widget, text: markdown });
  }, defaultDebounceMs);

  return <RichText value={widget.text} onChange={updateText} />;
};

export default Textual;
