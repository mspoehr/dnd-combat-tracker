import { createRoot } from "react-dom/client";
import QuickAddModal from "./QuickAddModal";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  root.render(<QuickAddModal />);
});
