import { createRoot } from "react-dom/client";
import DndCombatTracker from "./DndCombatTracker";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  root.render(<DndCombatTracker />);
});
