import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Creature } from "../models";
import { RootState } from "../store";

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
  name: "initiativeTracker",
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
    },
    next: (state) => {
      state.currentTurn = (state.currentTurn + 1) % state.creatures.length;
      if (state.currentTurn === 0) {
        state.round += 1;
      }
    }
  }
});

export const { addCreature, next } = initiativeTrackerSlice.actions;
export const selectInitiativeTurn = (state: RootState): number => state.initiativeTracker.currentTurn;
export const selectInitiativeRound = (state: RootState): number => state.initiativeTracker.round;

export default initiativeTrackerSlice.reducer;
