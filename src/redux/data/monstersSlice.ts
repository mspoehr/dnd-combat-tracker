import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import naturalCompare from "string-natural-compare";
import { Creature } from "../models";

interface Monster extends Creature {
  type: "monster";
}

export const monstersAdapter = createEntityAdapter<Monster>({
  selectId: (monster) => monster.uuid,
  sortComparer: (a, b) => naturalCompare(a.name, b.name, { caseInsensitive: true })
});

export const monstersSlice = createSlice({
  name: "monsters",
  initialState: monstersAdapter.getInitialState,
  reducers: {
    addMonster: monstersAdapter.addOne,
    removeMonster: monstersAdapter.removeOne
  }
});

export const { addMonster, removeMonster } = monstersSlice.actions;

export default monstersSlice.reducer;
