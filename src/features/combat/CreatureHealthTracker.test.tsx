import { createRoot } from "react-dom/client";
import CreatureHealthTracker from "./CreatureHealthTracker";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  root.render(<CreatureHealthTracker uuid="aabbcc" />);
});
