import reducer, {
  addCreatures,
  deleteCreature,
  editCreature,
  changeInitiative,
  next,
  previous,
  adjustCreatureHealth,
  reorderCreature,
  restartEncounter,
  clearEncounter,
  InitiativeCreature,
  selectInitiativeTurn,
  selectInitiativeRound,
  selectSortedCreatureUuids,
  selectCreatureByUuid,
  selectCreatureCurrentHp,
  copyCreature
} from "./initiativeTrackerSlice";
import { CreatureType } from "../../common/models";
import { RootState } from "../../app/store";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";

const createCreature = (attributes?: Partial<InitiativeCreature>): InitiativeCreature => ({
  uuid: uuidv4(),
  initiative: Math.floor(Math.random() * 20) + 1,
  currentHp: 30,
  name: "A monster",
  maxHp: 30,
  ac: Math.floor(Math.random() * 10) + 10,
  type: "monster",
  ...attributes
});

const sliceState = (creatures: InitiativeCreature[], currentTurn: number, round: number) => ({
  creatures: _.fromPairs(creatures.map((creature) => [creature.uuid, creature])),
  sortedCreatureUuids: creatures.map((creature) => creature.uuid),
  currentTurn,
  round
});

const creature1 = createCreature({ initiative: 20 });
const creature2 = createCreature({ initiative: 10 });

const emptyTurnOrder = sliceState([], 0, 0);
const oneCreatureAdded = sliceState([creature1], 0, 0);
const twoCreaturesAdded = sliceState([creature1, creature2], 0, 0);

describe("addCreature", () => {
  const nextState = (
    state: ReturnType<typeof sliceState>,
    creatures: InitiativeCreature[]
  ): ReturnType<typeof sliceState> => reducer(state, addCreatures(creatures));

  it("can add a creature when none exist", () => {
    expect(nextState(emptyTurnOrder, [creature1])).toEqual(sliceState([creature1], 0, 0));
  });

  it("can add a creature when one already exists", () => {
    expect(nextState(sliceState([creature1], 0, 0), [creature2])).toEqual(twoCreaturesAdded);
  });

  it("can add multiple creatures at once", () => {
    expect(nextState(emptyTurnOrder, [creature1, creature2])).toEqual(twoCreaturesAdded);
  });

  it("inserts creatures in sorted order", () => {
    const creature3 = createCreature({ initiative: 25 });
    const creature4 = createCreature({ initiative: 15 });
    const creature5 = createCreature({ initiative: 5 });

    expect(nextState(twoCreaturesAdded, [creature3, creature4, creature5])).toEqual(
      sliceState([creature3, creature1, creature4, creature2, creature5], 0, 0)
    );
  });

  it("inserts creatures with the same initiative in given order", () => {
    const newCreature1 = createCreature({ initiative: 21 });
    const newCreature2 = createCreature({ initiative: 21 });

    expect(nextState(oneCreatureAdded, [newCreature1, newCreature2])).toEqual(
      sliceState([newCreature1, newCreature2, creature1], 0, 0)
    );
  });

  describe("preserving current creature's turn", () => {
    const existingCreature1 = createCreature({ initiative: 17 });
    const existingCreature2 = createCreature({ initiative: 15 });
    const newCreature = createCreature({ initiative: 16 });

    it("preserves the turn of the current creature", () => {
      const originalState = sliceState([existingCreature1, existingCreature2], 1, 1);
      const expectedState = sliceState([existingCreature1, newCreature, existingCreature2], 2, 1);

      expect(nextState(originalState, [newCreature])).toEqual(expectedState);
    });

    it("preserves the current turn if it is the top of a round", () => {
      const newCreature = createCreature({ initiative: 18 });

      const originalState = sliceState([existingCreature1, existingCreature2], 0, 1);
      const expectedState = sliceState([newCreature, existingCreature1, existingCreature2], 1, 1);

      expect(nextState(originalState, [newCreature])).toEqual(expectedState);
    });

    it("does not preserve the turn order if combat has not started", () => {
      const newCreature = createCreature({ initiative: 18 });

      const originalState = sliceState([existingCreature1, existingCreature2], 0, 0);
      const expectedState = sliceState([newCreature, existingCreature1, existingCreature2], 0, 0);

      expect(nextState(originalState, [newCreature])).toEqual(expectedState);
    });
  });
});

describe("deleteCreature", () => {
  const nextState = (state: ReturnType<typeof sliceState>, uuid: string): ReturnType<typeof sliceState> =>
    reducer(state, deleteCreature(uuid));

  it("removes a creature from the initiative order", () => {
    expect(nextState(twoCreaturesAdded, creature2.uuid)).toEqual(oneCreatureAdded);
  });

  it("removes a creature that is not last from the initiative order", () => {
    const expectedState = sliceState([creature2], 0, 0);

    expect(nextState(twoCreaturesAdded, creature1.uuid)).toEqual(expectedState);
  });

  it("removes the last creature from the initiative order", () => {
    expect(nextState(oneCreatureAdded, creature1.uuid)).toEqual(emptyTurnOrder);
  });

  describe("preserving current creature's turn", () => {
    const creature3 = createCreature({ initiative: 9 });

    it("preserves the turn of the current creature", () => {
      // It's currently creature 2's turn.
      const originalState = sliceState([creature1, creature2, creature3], 1, 1);
      const expectedState = sliceState([creature2, creature3], 0, 1);

      expect(nextState(originalState, creature1.uuid)).toEqual(expectedState);
    });

    it("leaves the current turn alone if it is the top of a round", () => {
      const originalState = sliceState([creature1, creature2, creature3], 0, 1);
      const expectedState = sliceState([creature2, creature3], 0, 1);

      expect(nextState(originalState, creature1.uuid)).toEqual(expectedState);
    });

    it("handles deleting the creature whose turn it is gracefully", () => {
      // It's currently creature 2's turn.
      const originalState = sliceState([creature1, creature2, creature3], 1, 1);
      const expectedState = sliceState([creature1, creature3], 1, 1);

      expect(nextState(originalState, creature2.uuid)).toEqual(expectedState);
    });
  });
});

describe("editCreature", () => {
  const nextState = (
    state: ReturnType<typeof sliceState>,
    uuid: string,
    creature: Partial<InitiativeCreature>
  ): ReturnType<typeof sliceState> => reducer(Object.assign({}, state), editCreature({ ...creature, uuid }));

  const updates = {
    name: "a new name",
    ac: creature1.ac + 1,
    maxHp: creature1.maxHp * 2,
    initiative: creature1.initiative + 5,
    type: "player" as CreatureType,
    quantity: 0
  };

  it("updates the creature's attributes", () => {
    const expectedState = sliceState([{ ...creature1, ...updates }], 0, 0);

    expect(nextState(oneCreatureAdded, creature1.uuid, updates)).toEqual(expectedState);
  });

  it("updates a creature's attributes after they went in combat", () => {
    // It's currently creature 2's turn
    const originalState = sliceState([creature1, creature2], 1, 1);
    const expectedState = sliceState([{ ...creature1, ...updates }, creature2], 1, 1);

    expect(nextState(originalState, creature1.uuid, updates)).toEqual(expectedState); // update creature 1
  });

  it("sorts the initiative order again", () => {
    const expectedState = sliceState([{ ...creature2, ...updates }, creature1], 0, 0);

    expect(nextState(twoCreaturesAdded, creature2.uuid, updates)).toEqual(expectedState);
  });

  it("does not reorder creatures with duplicate initiatives", () => {
    const thisUpdates = { ...updates, initiative: creature1.initiative };
    const expectedState = sliceState([creature1, { ...creature2, ...thisUpdates }], 0, 0);

    expect(nextState(twoCreaturesAdded, creature2.uuid, thisUpdates)).toEqual(expectedState);
  });
});

describe("copyCreature", () => {
  const nextState = (
    state: ReturnType<typeof sliceState>,
    srcUuid: string,
    copyUuid: string
  ): ReturnType<typeof sliceState> => reducer(state, copyCreature({ srcUuid, copyUuid }));

  const copyUuid = uuidv4();

  it("duplicates a creature", () => {
    const expectedState = sliceState([creature1, { ...creature1, uuid: copyUuid }], 0, 0);

    expect(nextState(oneCreatureAdded, creature1.uuid, copyUuid)).toEqual(expectedState);
  });

  it("inserts new creature right after the source creature", () => {
    const sameInitCreature2 = { ...creature2, initiative: creature1.initiative };
    const origState = sliceState([creature1, sameInitCreature2], 0, 0);
    const expectedState = sliceState([creature1, { ...creature1, uuid: copyUuid }, sameInitCreature2], 0, 0);

    expect(nextState(origState, creature1.uuid, copyUuid)).toEqual(expectedState);
  });

  it("preserves the turn of the current creature", () => {
    const originalState = sliceState([creature1, creature2], 1, 1);
    const expectedState = sliceState([creature1, { ...creature1, uuid: copyUuid }, creature2], 2, 1);

    expect(nextState(originalState, creature1.uuid, copyUuid)).toEqual(expectedState);
  });
});

describe("previous", () => {
  const nextState = (state: ReturnType<typeof sliceState>): ReturnType<typeof sliceState> => reducer(state, previous());

  it("decrements the current turn", () => {
    const middleOfCombat = sliceState([creature1, creature2], 2, 2);
    const expectedState = sliceState([creature1, creature2], 1, 2);

    expect(nextState(middleOfCombat)).toEqual(expectedState);
  });

  it("returns to the end of the previous round if it is the first creature's turn", () => {
    const topOfSecondRound = sliceState([creature1, creature2], 0, 1);
    const expectedState = sliceState([creature1, creature2], 1, 0);

    expect(nextState(topOfSecondRound)).toEqual(expectedState);
  });

  it("does nothing if it is the start of the first round", () => {
    expect(nextState(twoCreaturesAdded)).toEqual(twoCreaturesAdded);
  });
});

describe("next", () => {
  const nextState = (state: ReturnType<typeof sliceState>): ReturnType<typeof sliceState> => reducer(state, next());

  it("increments the current turn", () => {
    const expectedState = sliceState([creature1, creature2], 1, 0);

    expect(nextState(twoCreaturesAdded)).toEqual(expectedState);
  });

  it("goes back to the top of the order for the next round", () => {
    const endOfFirstRound = sliceState([creature1, creature2], 1, 0);
    const expectedState = sliceState([creature1, creature2], 0, 1);

    expect(nextState(endOfFirstRound)).toEqual(expectedState);
  });
});

describe("changeInitiative", () => {
  const nextState = (
    state: ReturnType<typeof sliceState>,
    uuid: string,
    newInitiative: number | string
  ): ReturnType<typeof sliceState> => reducer(state, changeInitiative({ uuid, newInitiative: String(newInitiative) }));

  it("assigns the new initiative to the requested creature", () => {
    const expectedState = sliceState([{ ...creature1, initiative: creature1.initiative + 1 }, creature2], 0, 0);

    expect(nextState(twoCreaturesAdded, creature1.uuid, creature1.initiative + 1)).toEqual(expectedState);
  });

  it("does nothing if new initiative is invalid", () => {
    const invalidValues = [NaN, Infinity, "invalid"];
    invalidValues.forEach((value) =>
      expect(nextState(twoCreaturesAdded, creature1.uuid, value)).toEqual(twoCreaturesAdded)
    );
  });

  it("assumes that an empty string means 0", () => {
    const expectedState = sliceState([creature2, { ...creature1, initiative: 0 }], 0, 0);

    expect(nextState(twoCreaturesAdded, creature1.uuid, "")).toEqual(expectedState);
  });

  it("updates a creature's initiative after they went in combat", () => {
    // It's currently creature 2's turn
    const originalState = sliceState([creature1, creature2], 1, 1);
    const expectedState = sliceState([{ ...creature1, initiative: creature1.initiative + 5 }, creature2], 1, 1);

    // update creature 1
    expect(nextState(originalState, creature1.uuid, creature1.initiative + 5)).toEqual(expectedState);
  });

  it("sorts the initiative order again", () => {
    const expectedState = sliceState([{ ...creature2, initiative: creature1.initiative + 1 }, creature1], 0, 0);

    expect(nextState(twoCreaturesAdded, creature2.uuid, creature1.initiative + 1)).toEqual(expectedState);
  });

  it("places creatures with same initiative at the end of the same count", () => {
    const creature3 = createCreature({ initiative: 1 });
    const state = sliceState([creature1, creature2, creature3], 0, 0);
    const expectedState = sliceState([creature1, { ...creature3, initiative: creature1.initiative }, creature2], 0, 0);

    expect(nextState(state, creature3.uuid, creature1.initiative)).toEqual(expectedState);
  });

  it("does not reorder anything if it is not necessary", () => {
    const expectedState = sliceState([creature1, { ...creature2, initiative: creature1.initiative }], 0, 0);

    expect(nextState(twoCreaturesAdded, creature2.uuid, creature1.initiative)).toEqual(expectedState);
  });
});

// Hard to test this; this logic should not exist in reducers anyways
describe("rollAllInitiative", () => {
  it.todo("randomizes the initiative of all monsters");
  it.todo("does not modify initiatives of player type creatures");
  it.todo("sorts the initiative order again");
});

describe("adjustCreatureHealth", () => {
  const damagedCreature = createCreature({ currentHp: 15 });

  const nextState = (
    state: ReturnType<typeof sliceState>,
    uuid: string,
    amount: number
  ): ReturnType<typeof sliceState> => reducer(state, adjustCreatureHealth({ uuid, amount }));

  it("heals the creature by the specified amount if it is positive", () => {
    const currentState = sliceState([damagedCreature], 0, 0);
    const expectedState = sliceState([{ ...damagedCreature, currentHp: damagedCreature.currentHp + 5 }], 0, 0);

    expect(nextState(currentState, damagedCreature.uuid, 5)).toEqual(expectedState);
  });

  it("damages the creature by the specified amount if it is negative", () => {
    const currentState = sliceState([damagedCreature], 0, 0);
    const expectedState = sliceState([{ ...damagedCreature, currentHp: damagedCreature.currentHp - 5 }], 0, 0);

    expect(nextState(currentState, damagedCreature.uuid, -5)).toEqual(expectedState);
  });

  it("cannot modify creature health to be less than zero", () => {
    const currentState = sliceState([damagedCreature], 0, 0);
    const expectedState = sliceState([{ ...damagedCreature, currentHp: 0 }], 0, 0);

    expect(nextState(currentState, damagedCreature.uuid, damagedCreature.maxHp * -2)).toEqual(expectedState);
  });

  it("cannot modify creature health to be above its max hit points", () => {
    const currentState = sliceState([damagedCreature], 0, 0);
    const expectedState = sliceState([{ ...damagedCreature, currentHp: damagedCreature.maxHp }], 0, 0);

    expect(nextState(currentState, damagedCreature.uuid, damagedCreature.maxHp * 2)).toEqual(expectedState);
  });

  it("updates a creature's health after they went in combat", () => {
    const originalState = sliceState([damagedCreature, creature1], 1, 1);
    const expectedState = sliceState(
      [{ ...damagedCreature, currentHp: damagedCreature.currentHp + 5 }, creature1],
      1,
      1
    );

    expect(nextState(originalState, damagedCreature.uuid, 5)).toEqual(expectedState);
  });
});

describe("reorderCreature", () => {
  const nextState = (
    state: ReturnType<typeof sliceState>,
    srcUuid: string,
    destUuid: string
  ): ReturnType<typeof sliceState> => reducer(state, reorderCreature({ srcUuid, destUuid }));

  const creature3 = createCreature({ initiative: 5 });
  const threeCreaturesAdded = sliceState([creature1, creature2, creature3], 0, 0);

  it("sets the initiative to that of the creature it was moved onto", () => {
    const expectedState = sliceState([creature2, { ...creature1, initiative: creature2.initiative }], 0, 0);

    expect(nextState(twoCreaturesAdded, creature1.uuid, creature2.uuid)).toEqual(expectedState);
  });

  it("is ordered before the creature it was moved onto if moved sooner in the order", () => {
    const expectedState = sliceState([creature1, { ...creature3, initiative: creature2.initiative }, creature2], 0, 0);

    expect(nextState(threeCreaturesAdded, creature3.uuid, creature2.uuid)).toEqual(expectedState);
  });

  it("is ordered after the creature it was moved onto if moved later in the order", () => {
    const expectedState = sliceState([creature2, { ...creature1, initiative: creature2.initiative }, creature3], 0, 0);

    expect(nextState(threeCreaturesAdded, creature1.uuid, creature2.uuid)).toEqual(expectedState);
  });

  it("can reorder creatures to the beginning of initiative", () => {
    const expectedState = sliceState([{ ...creature3, initiative: creature1.initiative }, creature1, creature2], 0, 0);

    expect(nextState(threeCreaturesAdded, creature3.uuid, creature1.uuid)).toEqual(expectedState);
  });

  it("can reorder creatures to the end of initiative", () => {
    const expectedState = sliceState([creature2, creature3, { ...creature1, initiative: creature3.initiative }], 0, 0);

    expect(nextState(threeCreaturesAdded, creature1.uuid, creature3.uuid)).toEqual(expectedState);
  });

  it("does nothing if the creature is reordered to itself", () => {
    expect(nextState(threeCreaturesAdded, creature1.uuid, creature1.uuid)).toEqual(threeCreaturesAdded);
    expect(nextState(threeCreaturesAdded, creature2.uuid, creature2.uuid)).toEqual(threeCreaturesAdded);
    expect(nextState(threeCreaturesAdded, creature3.uuid, creature3.uuid)).toEqual(threeCreaturesAdded);
  });

  describe("when combat has started", () => {
    const creature4 = createCreature({ initiative: 2 });
    const creature5 = createCreature({ initiative: 1 });
    const fiveCreaturesAdded = sliceState([creature1, creature2, creature3, creature4, creature5], 2, 0);

    it("reorders creatures who have already gone", () => {
      // backwards
      let expectedState = sliceState(
        [{ ...creature2, initiative: creature1.initiative }, creature1, creature3, creature4, creature5],
        2,
        0
      );

      expect(nextState(fiveCreaturesAdded, creature2.uuid, creature1.uuid)).toEqual(expectedState);

      // forwards
      expectedState = sliceState(
        [creature2, { ...creature1, initiative: creature2.initiative }, creature3, creature4, creature5],
        2,
        0
      );

      expect(nextState(fiveCreaturesAdded, creature1.uuid, creature2.uuid)).toEqual(expectedState);
    });

    it("reorders creatures who have not gone", () => {
      // backwards
      let expectedState = sliceState(
        [creature1, creature2, creature3, { ...creature5, initiative: creature4.initiative }, creature4],
        2,
        0
      );

      expect(nextState(fiveCreaturesAdded, creature5.uuid, creature4.uuid)).toEqual(expectedState);

      // forwards
      expectedState = sliceState(
        [creature1, creature2, creature3, creature5, { ...creature4, initiative: creature5.initiative }],
        2,
        0
      );

      expect(nextState(fiveCreaturesAdded, creature4.uuid, creature5.uuid)).toEqual(expectedState);
    });

    it("reorders creatures who have already gone to a position that has not gone", () => {
      const expectedState = sliceState(
        [creature2, creature3, { ...creature1, initiative: creature4.initiative }, creature4, creature5],
        1, // should preserve the turn of creature3
        0
      );

      expect(nextState(fiveCreaturesAdded, creature1.uuid, creature4.uuid)).toEqual(expectedState);
    });

    it("reorders creatures who have not gone to a position that have already gone", () => {
      const expectedState = sliceState(
        [creature1, { ...creature5, initiative: creature1.initiative }, creature2, creature3, creature4],
        3, // should preserve the turn of creature3
        0
      );

      expect(nextState(fiveCreaturesAdded, creature5.uuid, creature1.uuid)).toEqual(expectedState);
    });

    it("reorders a creature who has already gone to have their turn now", () => {
      const expectedState = sliceState(
        [creature2, { ...creature1, initiative: creature3.initiative }, creature3, creature4, creature5],
        1,
        0
      );

      expect(nextState(fiveCreaturesAdded, creature1.uuid, creature3.uuid)).toEqual(expectedState);
    });

    it("reorders the creature whose turn it is to have already gone", () => {
      const expectedState = sliceState(
        [creature1, { ...creature3, initiative: creature1.initiative }, creature2, creature4, creature5],
        3,
        0
      );

      expect(nextState(fiveCreaturesAdded, creature3.uuid, creature1.uuid)).toEqual(expectedState);
    });
  });
});

describe("restartEncounter", () => {
  const damagedcreature1 = createCreature({ currentHp: 15, maxHp: 30 });
  const damagedcreature2 = createCreature({ currentHp: 10, maxHp: 45 });

  const middleOfCombat = sliceState([damagedcreature1, damagedcreature2], 1, 2);

  it("goes back to the start of first round", () => {
    const newState = reducer(middleOfCombat, restartEncounter());

    expect(newState.currentTurn).toEqual(0);
    expect(newState.round).toEqual(0);
  });

  it("sets the current hit points of all creatures to their hit point maximum", () => {
    const newState = reducer(middleOfCombat, restartEncounter());

    expect(newState.sortedCreatureUuids.map((uuid) => newState.creatures[uuid].currentHp)).toEqual([30, 45]);
  });
});

describe("clearEncounter", () => {
  it("removes all creatures from the initiative order", () => {
    const newState = reducer(twoCreaturesAdded, clearEncounter());

    expect(Object.keys(newState.creatures).length).toEqual(0);
  });

  it("goes back to the start of the first round", () => {
    const middleOfCombat = sliceState([creature1, creature2], 1, 2);
    const newState = reducer(middleOfCombat, clearEncounter());

    expect(newState.currentTurn).toEqual(0);
    expect(newState.round).toEqual(0);
  });
});

describe("selectInitiativeTurn", () => {
  it("returns the current turn", () => {
    const currentState = { initiativeTracker: { creatures: [], currentTurn: 1, round: 2 } } as unknown as RootState;

    expect(selectInitiativeTurn(currentState)).toEqual(1);
  });
});

describe("selectInitiativeRound", () => {
  it("returns the current round", () => {
    const currentState = { initiativeTracker: { creatures: [], currentTurn: 1, round: 2 } } as unknown as RootState;

    expect(selectInitiativeRound(currentState)).toEqual(2);
  });
});

describe("selectCreatureByUuid", () => {
  it("returns the requested uuid", () => {
    const currentState = { initiativeTracker: twoCreaturesAdded } as unknown as RootState;

    expect(selectCreatureByUuid(creature2.uuid)(currentState)).toEqual(creature2);
  });
});

describe("selectCreatureCurrentHp", () => {
  it("returns the requested uuid", () => {
    const currentState = { initiativeTracker: twoCreaturesAdded } as unknown as RootState;

    expect(selectCreatureCurrentHp(creature2.uuid)(currentState)).toEqual(creature2.currentHp);
  });
});

describe("selectCreatureMaxHp", () => {
  it("returns the requested uuid", () => {
    const currentState = { initiativeTracker: twoCreaturesAdded } as unknown as RootState;

    expect(selectCreatureCurrentHp(creature2.uuid)(currentState)).toEqual(creature2.maxHp);
  });
});

describe("selectSortedInitiativeCreatures", () => {
  it("returns an ordered list of creatures where the first creature is whose turn it is", () => {
    const secondCreaturesTurn = sliceState([creature1, creature2], 1, 0);

    const currentState = { initiativeTracker: secondCreaturesTurn } as unknown as RootState;

    expect(selectSortedCreatureUuids(currentState)).toEqual([creature2.uuid, creature1.uuid]);
  });
});
