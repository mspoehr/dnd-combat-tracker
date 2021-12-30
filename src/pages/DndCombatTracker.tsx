import React from "react";
import { Outlet } from "react-router-dom";

const DndCombatTracker: React.FunctionComponent = () => (
  <div style={{ margin: "10px" }}>
    <Outlet />
  </div>
);

export default DndCombatTracker;
