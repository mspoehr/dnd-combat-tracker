import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { InitiativeCreature } from "./initiativeTrackerSlice";

const initialState = {
  name: "",
  ac: 0,
  maxHp: 0,
  initiative: 0,
  modalOpen: false,
  editingMode: false,
  editIndex: 0
};

export const quickAddSlice = createSlice({
  name: "quickAdd",
  initialState,
  reducers: {
    changeName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    changeAc: (state, action: PayloadAction<number>) => {
      if (isNaN(action.payload)) {
        return;
      } else {
        state.ac = action.payload;
      }
    },
    changeMaxHp: (state, action: PayloadAction<number>) => {
      if (isNaN(action.payload)) {
        return;
      } else {
        state.maxHp = action.payload;
      }
    },
    changeInitiative: (state, action: PayloadAction<number>) => {
      if (isNaN(action.payload)) {
        return;
      } else {
        state.initiative = action.payload;
      }
    },
    open: (state) => {
      state.modalOpen = true;
    },
    close: (state) => {
      state.modalOpen = false;
      state.name = "";
      state.ac = 0;
      state.maxHp = 0;
      state.initiative = 0;
      state.editingMode = false;
    },
    edit: (state, action: PayloadAction<{ index: number; creature: InitiativeCreature }>) => {
      state.editingMode = true;
      state.name = action.payload.creature.name ?? "";
      state.ac = action.payload.creature.ac ?? 0;
      state.maxHp = action.payload.creature.maxHp ?? 0;
      state.initiative = action.payload.creature.initiative ?? 0;
      state.modalOpen = true;
      state.editIndex = action.payload.index;
    }
  }
});

export const { changeName, changeAc, changeMaxHp, changeInitiative } = quickAddSlice.actions;
export const { open, close, edit } = quickAddSlice.actions;
export const selectName = (state: RootState) => state.quickAdd.name;
export const selectAc = (state: RootState) => state.quickAdd.ac;
export const selectMaxHp = (state: RootState) => state.quickAdd.maxHp;
export const selectInitiative = (state: RootState) => state.quickAdd.initiative;
export const selectOpen = (state: RootState) => state.quickAdd.modalOpen;
export const selectEditingMode = (state: RootState) => state.quickAdd.editingMode;
export const selectEditIndex = (state: RootState) => state.quickAdd.editIndex;

export default quickAddSlice.reducer;
