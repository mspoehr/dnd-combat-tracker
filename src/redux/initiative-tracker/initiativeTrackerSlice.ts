import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Creature } from "../models";
import { RootState } from "../store";

export interface InitiativeCreature extends Partial<Creature> {
  initiative?: number | undefined;
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

function adjustedCreatureIndex(state: RootState["initiativeTracker"], index: number) {
  return (index + state.currentTurn) % state.creatures.length;
}

export const initiativeTrackerSlice = createSlice({
  name: "initiativeTracker",
  initialState,
  reducers: {
    addCreature: (state, action: PayloadAction<InitiativeCreature>) => {
      state.creatures.push(action.payload);
      sortInitiativeCreatures(state.creatures);
    },
    deleteCreature: (state, action: PayloadAction<number>) => {
      const index = adjustedCreatureIndex(state, action.payload);
      state.creatures.splice(index, 1);
    },
    previous: (state) => {
      state.currentTurn--;
      if (state.currentTurn === -1 && state.round > 0) {
        state.round -= 1;
        state.currentTurn = state.creatures.length - 1;
      }

      if (state.currentTurn < 0) {
        state.currentTurn = 0;
      }
      if (state.round < 0) {
        state.round = 0;
      }
    },
    editCreature: (state, action: PayloadAction<{ index: number; creature: InitiativeCreature }>) => {
      state.creatures[action.payload.index] = action.payload.creature;
      state.creatures = sortInitiativeCreatures(state.creatures);
    },
    next: (state) => {
      state.currentTurn = (state.currentTurn + 1) % Math.max(state.creatures.length, 1);
      if (state.currentTurn === 0) {
        state.round += 1;
      }
    },
    changeInitiative: (state, action: PayloadAction<{ index: number; newInitiative: string }>) => {
      const newInitiative = action.payload.newInitiative;
      if (isNaN(Number(newInitiative)) && newInitiative !== "") {
        return;
      }

      const index = adjustedCreatureIndex(state, action.payload.index);
      state.creatures[index].initiative = newInitiative === "" ? undefined : Number(newInitiative);
      sortInitiativeCreatures(state.creatures);
    }
  }
});

export const { addCreature, deleteCreature, editCreature, changeInitiative, next, previous } =
  initiativeTrackerSlice.actions;
export const selectInitiativeTurn = (state: RootState): number => state.initiativeTracker.currentTurn;
export const selectInitiativeRound = (state: RootState): number => state.initiativeTracker.round;
export const selectInitiativeCreatures = (state: RootState): InitiativeCreature[] => state.initiativeTracker.creatures;

export const selectSortedInitiativeCreatures = createSelector(
  selectInitiativeCreatures,
  selectInitiativeTurn,
  (creatures, turn) => creatures.slice(turn).concat(creatures.slice(0, turn))
);

export default initiativeTrackerSlice.reducer;
