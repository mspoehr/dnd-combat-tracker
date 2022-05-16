import { createRoot } from "react-dom/client";
import EditEncounter from "./EditEncounter";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  root.render(<EditEncounter />);
});
