import { createRoot } from "react-dom/client";
import MyMonsters from "./MyMonsters";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  root.render(<MyMonsters />);
});
