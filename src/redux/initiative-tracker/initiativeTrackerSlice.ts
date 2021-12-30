import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Creature } from "../models";
import { RootState } from "../store";

export interface InitiativeCreature extends Partial<Creature> {
  initiative?: number;
  currentHp?: number;
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
    addCreature: (state, action: PayloadAction<InitiativeCreature>) => {
      const creature = action.payload;
      state.creatures.push(creature);
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
export const selectInitiativeCreatures = (state: RootState): InitiativeCreature[] => state.initiativeTracker.creatures;

export const selectSortedInitiativeCreatures = createSelector(selectInitiativeCreatures, (creatures) =>
  [...creatures].sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0))
);

export default initiativeTrackerSlice.reducer;
