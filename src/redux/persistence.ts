import { RootState, store } from "./store";

export const saveState = (): void => {
  try {
    const state = store.getState();

    localStorage.setItem("state", JSON.stringify(state));
  } catch {
    console.log("Couldn't save the app state!");
  }
};

export const loadState = (): RootState | undefined => {
  try {
    const serializedState = localStorage.getItem("state");

    if (serializedState === null) {
      return undefined;
    }

    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};
