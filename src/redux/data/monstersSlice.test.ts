import reducer, { addMonster, Monster, removeMonster } from "./monstersSlice";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";

const monster = (name: string, maxHp: number, ac: number): Monster => ({
  uuid: uuidv4(),
  name,
  maxHp,
  ac,
  type: "monster"
});

const sliceState = (monsters: Monster[]) => {
  const ids = monsters.map((encounter) => encounter.uuid);
  return {
    entities: _.zipObject(ids, monsters),
    ids
  };
};

it("adds monsters when none exist", () => {
  const newMonster = monster("My Monster", 60, 10);

  expect(reducer(sliceState([]), addMonster(newMonster))).toEqual({
    entities: { [newMonster.uuid]: newMonster },
    ids: [newMonster.uuid]
  });
});

it("adds monsters when one already exists", () => {
  const firstMonster = monster("First Monster", 10, 10);
  const secondMonster = monster("Second Monster", 50, 16);

  expect(reducer(sliceState([firstMonster]), addMonster(secondMonster))).toEqual(
    sliceState([firstMonster, secondMonster])
  );
});

it("removes encounters", () => {
  const existing = monster("My Monster", 30, 10);

  expect(reducer(sliceState([existing]), removeMonster(existing.uuid))).toEqual(sliceState([]));
});
