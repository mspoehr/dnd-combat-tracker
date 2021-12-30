import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import encountersSlice from "./data/encountersSlice";
import monstersSlice from "./data/monstersSlice";
import initiativeTrackerSlice from "./initiative-tracker/initiativeTrackerSlice";

export const store = configureStore({
  reducer: {
    encounters: encountersSlice,
    monsters: monstersSlice,
    initiativeTracker: initiativeTrackerSlice
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
