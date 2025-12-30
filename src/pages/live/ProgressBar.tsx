import React, { useState } from "react";

const ProgressBar = (props: { id: string }) => {
  const [mode, setMode] = useState<boolean>(false);
  return (
    <div
      onClick={() => {
        setMode(!mode);
      }}
      style={mode ? { writingMode: "vertical-rl" } : {}}
    >
      ProgressBar
    </div>
  );
};

export default ProgressBar;
