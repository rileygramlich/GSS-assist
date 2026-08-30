import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
// After App, so it lands after every product stylesheet it adjusts.
import "./shared/layout.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
