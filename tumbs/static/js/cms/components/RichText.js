import React from "react";
import { _ } from "../i18n";
import { MDXEditor, BoldItalicUnderlineToggles, BlockTypeSelect, CreateLink, ListsToggle } from "@mdxeditor/editor";
import { headingsPlugin, listsPlugin, linkPlugin, linkDialogPlugin, toolbarPlugin } from "@mdxeditor/editor";

const translations = {
  toolbar: {
    bold: _("Bold"),
    removeBold: _("Remove bold"),
    italic: _("Italic"),
    removeItalic: _("Remove italic"),
    underline: _("Underline"),
    removeUnderline: _("Remove underline"),
    link: _("Create link"),
    bulletedList: _("Bulleted list"),
    numberedList: _("Numbered list"),
    blockTypes: {
      paragraph: _("Paragraph"),
      heading: _("Heading {level}"),
    },
    blockTypeSelect: {
      selectBlockTypeTooltip: _("Select block type"),
      placeholder: _("Block type"),
    },
  },
  linkPreview: {
    open: _("Open {url} in new window"),
    edit: _("Edit link URL"),
    copyToClipboard: _("Copy to clipboard"),
    copied: _("Copied!"),
    remove: _("Remove link"),
  },
  createLink: {
    url: _("URL"),
    urlPlaceholder: _("Select or paste an URL"),
    title: _("Title"),
    saveTooltip: _("Set URL"),
    cancelTooltip: _("Cancel change"),
  },
  dialogControls: {
    save: _("Save"),
    cancel: _("Cancel"),
  },
};

const translate = (dict, path, fallback, params) => {
  const [first, ...rest] = path;
  const next = dict[first];

  if (rest.length) {
    return translate(next, rest, fallback, params);
  } else if (params && next) {
    return next.supplant(params);
  } else if (next) {
    return next;
  } else {
    return fallback;
  }
};

const RichText = ({ value, onChange }) => (
  <MDXEditor
    markdown={value}
    onChange={onChange}
    translation={(path, fallback, params) => translate(translations, path.split("."), fallback, params)}
    plugins={[
      headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
      listsPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      toolbarPlugin({
        toolbarContents: () => (
          <>
            <BoldItalicUnderlineToggles />
            <BlockTypeSelect />
            <CreateLink />
            <ListsToggle options={["bullet", "number"]} />
          </>
        ),
      }),
    ]}
  />
);

export default RichText;
