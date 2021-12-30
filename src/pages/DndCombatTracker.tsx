import React from "react";
import { Outlet } from "react-router-dom";

const DndCombatTracker: React.FunctionComponent = () => (
  <div>
    <Outlet />
  </div>
);

export default DndCombatTracker;
