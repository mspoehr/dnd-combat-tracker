import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DndCombatTracker from "./pages/DndCombatTracker";
import EditEncounter from "./pages/EditEncounter";
import MyEncounters from "./pages/MyEncounters";
import MyMonsters from "./pages/MyMonsters";
import RunEncounter from "./pages/RunEncounter";

import "./App.css";

const App: React.FunctionComponent = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<DndCombatTracker />}>
        <Route path="encounters" element={<Navigate replace to="/" />}>
          <Route path=":id">
            <Route index element={<EditEncounter />} />
            <Route path="run" element={<RunEncounter />} />
          </Route>
        </Route>
        <Route path="monsters" element={<MyMonsters />} />
        <Route index element={<MyEncounters />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
