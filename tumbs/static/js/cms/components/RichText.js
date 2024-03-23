import React from "react";
import { MDXEditor, BoldItalicUnderlineToggles, BlockTypeSelect, CreateLink, ListsToggle } from "@mdxeditor/editor";
import { headingsPlugin, listsPlugin, linkPlugin, linkDialogPlugin, toolbarPlugin } from "@mdxeditor/editor";

const RichText = ({ value, onChange }) => (
  <MDXEditor
    markdown={value}
    onChange={onChange}
    plugins={[
      headingsPlugin(),
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
