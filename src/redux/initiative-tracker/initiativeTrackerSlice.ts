import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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

function sortInitiativeCreatures(creatures: InitiativeCreature[]) {
  creatures.sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));
  return creatures;
}

export const initiativeTrackerSlice = createSlice({
  name: "initiativeTracker",
  initialState,
  reducers: {
    addCreature: (state, action: PayloadAction<InitiativeCreature>) => {
      const creature = action.payload;

      // Re-sort the creatures according to the new initiative order
      const allCreatures = [...state.creatures, creature];
      state.creatures = sortInitiativeCreatures(allCreatures);
    },
    deleteCreature: (state, action: PayloadAction<number>) => {
      state.creatures.splice(action.payload, 1);
    },
    next: (state) => {
      state.currentTurn = (state.currentTurn + 1) % state.creatures.length;
      if (state.currentTurn === 0) {
        state.round += 1;
      }
    }
  }
});

export const { addCreature, deleteCreature, next } = initiativeTrackerSlice.actions;
export const selectInitiativeTurn = (state: RootState): number => state.initiativeTracker.currentTurn;
export const selectInitiativeRound = (state: RootState): number => state.initiativeTracker.round;
export const selectInitiativeCreatures = (state: RootState): InitiativeCreature[] => state.initiativeTracker.creatures;

export default initiativeTrackerSlice.reducer;
