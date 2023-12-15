import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootDivId = "pivony";
if (!document.getElementById(rootDivId)) {
  var div = document.createElement("div");
  div.id = rootDivId;
  document.body.appendChild(div);
}

ReactDOM.createRoot(document.getElementById(rootDivId)!).render(
  <React.StrictMode>
    <App />,
  </React.StrictMode>,
);
