import { createRoot } from "react-dom/client";
import EditCreatureModal from "./EditCreatureModal";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  root.render(<EditCreatureModal editUuid={null} setClosed={() => true} />);
  root.render(<EditCreatureModal editUuid="someuuid" setClosed={() => true} />);
});
