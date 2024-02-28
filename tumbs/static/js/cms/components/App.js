import React from "react";
import * as R from "ramda";

const App = ({ init }) => {
  const currentWebsite = R.head(init.websites);

  return <h1>{currentWebsite.name}</h1>;
};

export default App;
