import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultDebounceMs } from "../../config";
import RichText from "../RichText";

const Textual = ({ widget, onChange }) => {
  const updateWidget = useDebouncedCallback(
    // function
    (markdown) => {
      onChange({ ...widget, text: markdown });
    },
    // delay in ms
    defaultDebounceMs,
  );

  return <RichText value={widget.text} onChange={updateWidget} />;
};

export default Textual;
