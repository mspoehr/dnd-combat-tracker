import { createRoot } from "react-dom/client";
import AddCreaturesModal from "./AddCreaturesModal";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  root.render(<AddCreaturesModal open={true} setClosed={() => true} />);
});
