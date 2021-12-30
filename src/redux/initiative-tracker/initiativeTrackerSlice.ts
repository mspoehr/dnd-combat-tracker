import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Creature } from "../models";

interface InitiativeCreature extends Partial<Creature> {
  initiative?: number;
  currentHp: number;
}

const initialState = {
  creatures: [] as InitiativeCreature[],
  currentTurn: 0,
  round: 0
};

export const initiativeTrackerSlice = createSlice({
  name: "monsters",
  initialState,
  reducers: {
    addCreature: (state, action: PayloadAction<Partial<Creature>>) => {
      const creature = action.payload;
      const initiativeCreature = {
        initiative: undefined,
        currentHp: creature.maxHp ?? 0,
        ...creature
      };
      state.creatures.push(initiativeCreature);
    }
  }
});

export const { addCreature } = initiativeTrackerSlice.actions;

export default initiativeTrackerSlice.reducer;
