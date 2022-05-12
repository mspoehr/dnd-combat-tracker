import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";

import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

const container = document.getElementById("root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <Provider store={store}>
    {/* TOOD: someday, reenable strictmode. react-beautiful-dnd does not support React 18, and breaks with strict mode on */}
    <React.StrictMode></React.StrictMode>
    <App />
  </Provider>
);
