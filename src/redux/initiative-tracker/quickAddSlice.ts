import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

const initialState = {
  name: "",
  ac: 0,
  maxHp: 0,
  initiative: 0,
  quantity: 0
};

export const quickAddSlice = createSlice({
  name: "quickAdd",
  initialState,
  reducers: {
    changeName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    changeAc: (state, action: PayloadAction<number>) => {
      state.ac = action.payload;
    },
    changeMaxHp: (state, action: PayloadAction<number>) => {
      state.maxHp = action.payload;
    },
    changeInitiative: (state, action: PayloadAction<number>) => {
      state.initiative = action.payload;
    },
    changeQuantity: (state, action: PayloadAction<number>) => {
      state.quantity = action.payload;
    },
    setInitialState: (state) => {
      state.name = "";
      state.ac = 0;
      state.maxHp = 0;
      state.initiative = 0;
      state.quantity = 0;
    }
  }
});

export const { changeName } = quickAddSlice.actions;
export const { changeAc } = quickAddSlice.actions;
export const { changeMaxHp } = quickAddSlice.actions;
export const { changeInitiative } = quickAddSlice.actions;
export const { changeQuantity } = quickAddSlice.actions;
export const { setInitialState } = quickAddSlice.actions;
export const selectName = (state: RootState) => state.quickAdd.name;
export const selectAc = (state: RootState) => state.quickAdd.ac;
export const selectMaxHp = (state: RootState) => state.quickAdd.maxHp;
export const selectInitiative = (state: RootState) => state.quickAdd.initiative;
export const selectQuantity = (state: RootState) => state.quickAdd.quantity;

export default quickAddSlice.reducer;
