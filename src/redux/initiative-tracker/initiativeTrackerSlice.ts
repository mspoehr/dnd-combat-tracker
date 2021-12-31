import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Creature } from "../models";
import { RootState } from "../store";
import { v4 as uuidv4 } from "uuid";

export interface InitiativeCreature extends Creature {
  initiative: number;
  order: number;
  currentHp: number;
}
type InitiativeCreatureExternal = Omit<InitiativeCreature, "uuid" | "order">;

const initialState = {
  creatures: [] as InitiativeCreature[],
  currentTurn: 0,
  round: 0
};

// Pass creatures as sorted array (initiative descending, order ascending)
function normalizeCreatureOrders(creatures: InitiativeCreature[]) {
  let currentOrder = 0;
  let currentInitiative: number | null = null;
  creatures.forEach((creature) => {
    if (creature.initiative !== currentInitiative) {
      currentInitiative = creature.initiative;
      currentOrder = 0;
    } else {
      currentOrder++;
    }

    creature.order = currentOrder;
  });
}

function sortInitiativeCreatures(creatures: InitiativeCreature[]) {
  creatures.sort((a, b) => {
    const initiativeDiff = b.initiative - a.initiative;
    if (initiativeDiff === 0) {
      return a.order - b.order;
    }

    return initiativeDiff;
  });

  normalizeCreatureOrders(creatures);
}

function adjustedCreatureIndex(state: RootState["initiativeTracker"], index: number) {
  return (index + state.currentTurn) % state.creatures.length;
}

export const initiativeTrackerSlice = createSlice({
  name: "initiativeTracker",
  initialState,
  reducers: {
    addCreature: (state, action: PayloadAction<{ creature: InitiativeCreatureExternal; quantity: number }>) => {
      const currentTurnUuid = state.creatures[state.currentTurn]?.uuid;

      const creature: InitiativeCreature = { order: 0, uuid: uuidv4(), ...action.payload.creature };
      for (let i = 0; i < action.payload.quantity; i++) {
        state.creatures.push(creature);
      }
      sortInitiativeCreatures(state.creatures);

      // If combat has started, preserve the turn of the creature whose turn it currently is
      if (state.creatures.length > 1 && (state.currentTurn !== 0 || state.round !== 0)) {
        state.currentTurn = state.creatures.findIndex((creature) => creature.uuid === currentTurnUuid);
      }
    },
    deleteCreature: (state, action: PayloadAction<number>) => {
      const currentTurnUuid = state.creatures[state.currentTurn]?.uuid;

      const index = adjustedCreatureIndex(state, action.payload);
      state.creatures.splice(index, 1);

      // If combat has started, preserve the turn of the creature whose turn it currently is, unless they were just deleted
      if (state.creatures.length > 1 && (state.currentTurn !== 0 || state.round !== 0)) {
        const newTurn = state.creatures.findIndex((creature) => creature.uuid === currentTurnUuid);
        if (newTurn !== -1) {
          state.currentTurn = newTurn;
        }
      }
    },
    editCreature: (state, action: PayloadAction<{ index: number; creature: InitiativeCreatureExternal }>) => {
      const index = adjustedCreatureIndex(state, action.payload.index);
      state.creatures[index] = {
        ...state.creatures[index],
        ...action.payload.creature
      };
      sortInitiativeCreatures(state.creatures);
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
      state.creatures[index].initiative = newInitiative === "" ? 0 : Number(newInitiative);
      sortInitiativeCreatures(state.creatures);
    },
    rollAllInitiative: (state) => {
      state.creatures.forEach((creature) => {
        if (creature.type === "monster") {
          const min = 1;
          const max = 20;
          creature.initiative = Math.floor(Math.random() * (max - min + 1) + min);
          sortInitiativeCreatures(state.creatures);
        }
      });
    },
    adjustCreatureHealth: (state, action: PayloadAction<{ index: number; amount: number }>) => {
      const index = adjustedCreatureIndex(state, action.payload.index);

      const hp = state.creatures[index].currentHp + action.payload.amount;
      const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

      state.creatures[index].currentHp = clamp(hp, 0, state.creatures[index].maxHp);
    },
    reorderCreature: (state, action: PayloadAction<{ index: number; newIndex: number }>) => {
      const index = adjustedCreatureIndex(state, action.payload.index);
      const newIndex = adjustedCreatureIndex(state, action.payload.newIndex);

      state.creatures[index].initiative = state.creatures[newIndex].initiative;
      state.creatures[index].order = state.creatures[newIndex].order + (index < newIndex ? 1 : -1);

      sortInitiativeCreatures(state.creatures);
    }
  }
});

export const {
  addCreature,
  deleteCreature,
  editCreature,
  changeInitiative,
  next,
  previous,
  adjustCreatureHealth,
  rollAllInitiative,
  reorderCreature
} = initiativeTrackerSlice.actions;
export const selectInitiativeTurn = (state: RootState): number => state.initiativeTracker.currentTurn;
export const selectInitiativeRound = (state: RootState): number => state.initiativeTracker.round;
export const selectInitiativeCreatures = (state: RootState): InitiativeCreature[] => state.initiativeTracker.creatures;

export const selectSortedInitiativeCreatures = createSelector(
  selectInitiativeCreatures,
  selectInitiativeTurn,
  (creatures, turn) => creatures.slice(turn).concat(creatures.slice(0, turn))
);

export default initiativeTrackerSlice.reducer;
