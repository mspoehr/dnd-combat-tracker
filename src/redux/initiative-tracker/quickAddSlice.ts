import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CreatureType } from "../models";
import { RootState } from "../store";
import { InitiativeCreature } from "./initiativeTrackerSlice";

const initialState = {
  creatures: [
    {
      name: "",
      ac: 0,
      maxHp: 0,
      initiative: 0,
      type: "monster" as CreatureType,
      quantity: 1
    }
  ] as QuickAddCreature[],
  modalOpen: false,
  editingMode: false,
  editIndex: 0
};

export interface QuickAddCreature {
  name: string;
  ac: number;
  maxHp: number;
  initiative: number;
  type: CreatureType;
  quantity: number;
}

export const quickAddSlice = createSlice({
  name: "quickAdd",
  initialState,
  reducers: {
    changeName: (state, action: PayloadAction<{ name: string; index: number }>) => {
      state.creatures[action.payload.index].name = action.payload.name;
    },
    changeAc: (state, action: PayloadAction<{ ac: number; index: number }>) => {
      if (isNaN(action.payload.ac)) {
        return;
      }
      state.creatures[action.payload.index].ac = action.payload.ac;
    },
    changeMaxHp: (state, action: PayloadAction<{ maxHp: number; index: number }>) => {
      if (isNaN(action.payload.maxHp)) {
        return;
      }
      state.creatures[action.payload.index].maxHp = action.payload.maxHp;
    },
    changeInitiative: (state, action: PayloadAction<{ initiative: number; index: number }>) => {
      if (isNaN(action.payload.initiative)) {
        return;
      }
      state.creatures[action.payload.index].initiative = action.payload.initiative;
    },
    changeType: (state, action: PayloadAction<{ type: CreatureType; index: number }>) => {
      state.creatures[action.payload.index].type = action.payload.type;
    },
    changeQuantity: (state, action: PayloadAction<{ quantity: number; index: number }>) => {
      if (isNaN(action.payload.quantity)) {
        return;
      }
      state.creatures[action.payload.index].quantity = action.payload.quantity;
    },
    open: (state) => {
      state.modalOpen = true;
    },
    close: () => JSON.parse(JSON.stringify(initialState)),
    addRow: (state) => {
      const creature = {
        name: "",
        ac: 0,
        maxHp: 0,
        initiative: 0,
        type: "monster" as CreatureType,
        quantity: 1
      };
      state.creatures.push(creature);
    },
    edit: (state, action: PayloadAction<{ index: number; creature: InitiativeCreature }>) => {
      state.editingMode = true;
      state.creatures = [
        {
          name: action.payload.creature.name ?? "",
          ac: action.payload.creature.ac ?? 0,
          maxHp: action.payload.creature.maxHp ?? 0,
          initiative: action.payload.creature.initiative ?? 0,
          quantity: 0,
          type: action.payload.creature.type ?? "monster"
        }
      ];
      state.modalOpen = true;
      state.editIndex = action.payload.index;
    }
  }
});

export const {
  changeName,
  changeAc,
  changeMaxHp,
  changeInitiative,
  changeQuantity,
  open,
  close,
  edit,
  changeType,
  addRow
} = quickAddSlice.actions;
export const selectCreatures = (state: RootState): QuickAddCreature[] => state.quickAdd.creatures;
export const selectEditMode = (state: RootState): boolean => state.quickAdd.editingMode;
export const selectEditIndex = (state: RootState): number => state.quickAdd.editIndex;
export const selectModalOpen = (state: RootState): boolean => state.quickAdd.modalOpen;

export default quickAddSlice.reducer;
