import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RunEncounter from "../features/combat";
import EditEncounter from "../features/encounters/EditEncounter";
import MyEncounters from "../features/encounters/MyEncounters";
import MyMonsters from "../features/monsters/MyMonsters";

import "./App.css";
import DndCombatTracker from "./DndCombatTracker";

const App: React.FunctionComponent = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<DndCombatTracker />}>
        <Route path="encounters">
          <Route index element={<Navigate replace to="/" />} />
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
