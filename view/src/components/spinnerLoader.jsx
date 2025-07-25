import React from "react";
import { CircularProgress } from "@mui/material";

export const SpinnerLoader = () => {
  return <CircularProgress size = {30}/>;
};

const styles = {
  loader: {
    width: "40px",
    height: "40px",
    border: "1px solid #196b57",
    borderTop: "1px solid transparent",
    borderRadius: "50%",
  },
  animation: "spin .2s linear infinite",
};

// Define the keyframes using the CSSStyleSheet API
const sheet = new CSSStyleSheet();
sheet.insertRule(`
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
