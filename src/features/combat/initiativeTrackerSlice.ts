import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Creature } from "../../common/models";
import { RootState } from "../../app/store";
import _ from "lodash";

export interface InitiativeCreature extends Creature {
  initiative: number;
  initiativeMod?: number;
  currentHp: number;
}

const initialState = {
  creatures: {} as Record<string, InitiativeCreature>,
  sortedCreatureUuids: [] as string[],
  currentTurn: 0,
  round: 0
};

function compareCreature(creature1: InitiativeCreature, creature2: InitiativeCreature) {
  return creature2.initiative - creature1.initiative;
}

function sortInitiative(state: RootState["initiativeTracker"]) {
  state.sortedCreatureUuids.sort((uuidA, uuidB) => compareCreature(state.creatures[uuidA], state.creatures[uuidB]));
}

function preservingCurrentTurn(state: RootState["initiativeTracker"], func: () => void): void {
  const currentTurnUuid = state.sortedCreatureUuids[state.currentTurn];

  func();

  // If combat has started, preserve the turn of the creature whose turn it currently is, unless they were just deleted
  if (Object.keys(state.creatures).length > 1 && (state.currentTurn !== 0 || state.round !== 0)) {
    const newTurn = state.sortedCreatureUuids.findIndex((uuid) => uuid === currentTurnUuid);
    if (newTurn !== -1) {
      state.currentTurn = newTurn;
    }
  }
}

function sortTurnOrder<T>(creatures: T[], turn: number): T[] {
  return creatures.slice(turn).concat(creatures.slice(0, turn));
}

export const initiativeTrackerSlice = createSlice({
  name: "initiativeTracker",
  initialState,
  reducers: {
    addCreatures: (state, action: PayloadAction<InitiativeCreature[]>) => {
      preservingCurrentTurn(state, () => {
        action.payload.forEach((creature) => {
          state.creatures[creature.uuid] = creature;
          state.sortedCreatureUuids.push(creature.uuid);
        });

        sortInitiative(state);
      });
    },
    deleteCreature: (state, action: PayloadAction<string>) => {
      preservingCurrentTurn(state, () => {
        delete state.creatures[action.payload];
        _.pull(state.sortedCreatureUuids, action.payload);
      });
    },
    editCreature: (state, action: PayloadAction<Partial<InitiativeCreature> & { uuid: string }>) => {
      state.creatures[action.payload.uuid] = { ...state.creatures[action.payload.uuid], ...action.payload };
      sortInitiative(state);
    },
    copyCreature: (state, action: PayloadAction<{ srcUuid: string; copyUuid: string }>) => {
      preservingCurrentTurn(state, () => {
        state.creatures[action.payload.copyUuid] = {
          ...state.creatures[action.payload.srcUuid],
          uuid: action.payload.copyUuid
        };

        const srcIndex = _.indexOf(state.sortedCreatureUuids, action.payload.srcUuid);
        state.sortedCreatureUuids.splice(srcIndex + 1, 0, action.payload.copyUuid);
      });
    },
    previous: (state) => {
      state.currentTurn--;

      if (state.currentTurn === -1) {
        state.currentTurn = 0;

        if (state.round > 0) {
          state.round -= 1;
          state.currentTurn = Object.keys(state.creatures).length - 1;
        }
      }
    },
    next: (state) => {
      state.currentTurn = (state.currentTurn + 1) % Math.max(Object.keys(state.creatures).length, 1);
      if (state.currentTurn === 0) {
        state.round += 1;
      }
    },
    changeInitiative: (state, action: PayloadAction<{ uuid: string; newInitiative: string }>) => {
      const newInitiative = action.payload.newInitiative;
      if (!isFinite(Number(newInitiative)) && newInitiative !== "") {
        return;
      }

      state.creatures[action.payload.uuid].initiative = newInitiative === "" ? 0 : Number(newInitiative);
      sortInitiative(state);
    },
    rollAllInitiative: (state) => {
      Object.keys(state.creatures).forEach((uuid) => {
        const creature = state.creatures[uuid];
        if (creature.type === "monster") {
          const min = 1;
          const max = 20;
          creature.initiative = Math.floor(Math.random() * (max - min + 1) + min) + (creature.initiativeMod ?? 0);
        }
      });

      sortInitiative(state);
    },
    adjustCreatureHealth: (state, action: PayloadAction<{ uuid: string; amount: number }>) => {
      const hp = state.creatures[action.payload.uuid].currentHp + action.payload.amount;

      state.creatures[action.payload.uuid].currentHp = _.clamp(hp, 0, state.creatures[action.payload.uuid].maxHp);
    },
    reorderCreature: (state, action: PayloadAction<{ srcUuid: string; destUuid: string }>) => {
      const srcCreature = state.creatures[action.payload.srcUuid];
      const destCreature = state.creatures[action.payload.destUuid];

      srcCreature.initiative = destCreature.initiative;

      // Remove src creature from where it is, and then add it before the destination creature.
      // Must use display order since the order of the displayed creatures changes how the
      // caller of this action interprets src and dest uuids
      const displayOrder = sortTurnOrder(state.sortedCreatureUuids, state.currentTurn);
      const destIndex = _.indexOf(displayOrder, destCreature.uuid);
      _.pull(displayOrder, srcCreature.uuid);
      displayOrder.splice(destIndex, 0, srcCreature.uuid);

      // If a creature that already went is being moved to not having gone yet, then
      // we need to decrement the turn count since less creatures have gone. Likewise,
      // if the creature has not gone but is being moved to having already gone, then
      // we increment the turn count since more creatures have now gone. This both
      // preserves the turn of creature whose turn it currently is, and ensures that
      // the sorted turn order array stays sorted in descending initiative counts.
      // For this purpose, the creature whose turn it is considered to have "not gone"
      const sortedSrcIndex = _.indexOf(state.sortedCreatureUuids, srcCreature.uuid);
      const sortedDestIndex = _.indexOf(state.sortedCreatureUuids, destCreature.uuid);
      if (sortedSrcIndex < state.currentTurn && sortedDestIndex >= state.currentTurn) {
        state.currentTurn--;
      } else if (sortedSrcIndex >= state.currentTurn && sortedDestIndex < state.currentTurn) {
        state.currentTurn++;
      }

      // Undo sortTurnOrder above and return to proper sorted order with reorder in place
      state.sortedCreatureUuids = sortTurnOrder(displayOrder, displayOrder.length - state.currentTurn);
    },
    restartEncounter: (state) => {
      state.currentTurn = 0;
      state.round = 0;
      Object.keys(state.creatures).forEach((uuid) => {
        state.creatures[uuid].currentHp = state.creatures[uuid].maxHp;
      });
    },
    clearEncounter: () => JSON.parse(JSON.stringify(initialState))
  }
});

export const {
  addCreatures,
  deleteCreature,
  editCreature,
  copyCreature,
  changeInitiative,
  next,
  previous,
  adjustCreatureHealth,
  rollAllInitiative,
  reorderCreature,
  restartEncounter,
  clearEncounter
} = initiativeTrackerSlice.actions;
export const selectInitiativeTurn = (state: RootState): number => state.initiativeTracker.currentTurn;
export const selectInitiativeRound = (state: RootState): number => state.initiativeTracker.round;

export const selectCreatureByUuid =
  (uuid: string) =>
  (state: RootState): InitiativeCreature | undefined =>
    state.initiativeTracker.creatures[uuid];
export const selectCreatureCurrentHp = (uuid: string) => (state: RootState) =>
  state.initiativeTracker.creatures[uuid].currentHp;
export const selectCreatureMaxHp = (uuid: string) => (state: RootState) =>
  state.initiativeTracker.creatures[uuid].maxHp;

export const selectSortedCreatureUuids = createSelector(
  (state: RootState) => state.initiativeTracker.sortedCreatureUuids,
  selectInitiativeTurn,
  (uuids, turn) => sortTurnOrder(uuids, turn)
);

export default initiativeTrackerSlice.reducer;
