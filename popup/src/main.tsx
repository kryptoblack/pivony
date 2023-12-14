import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (!document.getElementById("pivony")) {
  const div = document.createElement("div");
  div.id = "pivony";
  document.body.appendChild(div);
}

ReactDOM.createRoot(document.getElementById("pivony")!).render(
  <React.StrictMode>
    <App />,
  </React.StrictMode>,
);
