import reducer, { addEncounter, Encounter, EncounterCreature, removeEncounter } from "./encountersSlice";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";

const encounter = (name: string, creatures: EncounterCreature[]): Encounter => ({
  uuid: uuidv4(),
  name,
  creatures
});

const sliceState = (encounters: Encounter[]) => {
  const ids = encounters.map((encounter) => encounter.uuid);
  return {
    entities: _.zipObject(ids, encounters),
    ids
  };
};

it("adds encounters when none exist", () => {
  const newEncounter = encounter("My Encounter", []);

  expect(reducer(sliceState([]), addEncounter(newEncounter))).toEqual({
    entities: { [newEncounter.uuid]: newEncounter },
    ids: [newEncounter.uuid]
  });
});

it("adds encounters when one already exists", () => {
  const firstEncounter = encounter("First Encounter", [{ creatureUuid: uuidv4() }]);
  const secondEncounter = encounter("Second Encounter", [{ creatureUuid: uuidv4() }]);

  expect(reducer(sliceState([firstEncounter]), addEncounter(secondEncounter))).toEqual(
    sliceState([firstEncounter, secondEncounter])
  );
});

it("removes encounters", () => {
  const existing = encounter("My Encounter", []);

  expect(reducer(sliceState([existing]), removeEncounter(existing.uuid))).toEqual(sliceState([]));
});
