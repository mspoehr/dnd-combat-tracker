import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import naturalCompare from "string-natural-compare";
import { UniqueEntity, UniqueIdType } from "../../common/models";

export interface EncounterCreature {
  creatureUuid: UniqueIdType;
}

export interface Encounter extends UniqueEntity {
  name: string;
  creatures: EncounterCreature[];
}

export const encountersAdapter = createEntityAdapter<Encounter>({
  selectId: (encounter) => encounter.uuid,
  sortComparer: (a, b) => naturalCompare(a.name, b.name, { caseInsensitive: true })
});

export const encountersSlice = createSlice({
  name: "encounters",
  initialState: encountersAdapter.getInitialState,
  reducers: {
    addEncounter: encountersAdapter.addOne,
    removeEncounter: encountersAdapter.removeOne
  }
});

export const { addEncounter, removeEncounter } = encountersSlice.actions;
export const { selectAll: selectAllEncounters } = encountersAdapter.getSelectors<RootState>(
  (state) => state.encounters
);

export default encountersSlice.reducer;
