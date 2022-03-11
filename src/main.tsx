import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const pathname = window.location.pathname;

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename={pathname.substring(0, pathname.lastIndexOf("/"))}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
