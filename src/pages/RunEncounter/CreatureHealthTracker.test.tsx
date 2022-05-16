import { createRoot } from "react-dom/client";
import CreatureHealthTracker from "./CreatureHealthTracker";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  root.render(
    <CreatureHealthTracker
      creature={{
        ac: 10,
        currentHp: 15,
        maxHp: 30,
        initiative: 1,
        name: "A creature",
        order: 0,
        type: "monster",
        uuid: "abcdefg"
      }}
      index={0}
    />
  );
});
