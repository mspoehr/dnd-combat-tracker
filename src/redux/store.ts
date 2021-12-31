import { CombinedState, combineReducers, configureStore, Reducer } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import encountersSlice from "./data/encountersSlice";
import monstersSlice from "./data/monstersSlice";
import initiativeTrackerSlice from "./initiative-tracker/initiativeTrackerSlice";
import quickAddSlice from "./initiative-tracker/quickAddSlice";
import { loadState, saveState } from "./persistence";

const rootReducer = combineReducers({
  encounters: encountersSlice,
  monsters: monstersSlice,
  initiativeTracker: initiativeTrackerSlice,
  quickAdd: quickAddSlice
});

// Infer the type of the root state from the root reducer itself
type ExtractStateType<P> = P extends Reducer<CombinedState<infer S>> ? S : never;
export type RootState = ExtractStateType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState()
});

store.subscribe(saveState);

// Infer `AppDispatch` types from the store itself
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
