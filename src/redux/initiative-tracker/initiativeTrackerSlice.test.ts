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
  InitiativeCreatureExternal,
  selectInitiativeTurn,
  selectInitiativeCreatures,
  selectInitiativeRound,
  selectSortedInitiativeCreatures
} from "./initiativeTrackerSlice";
import { CreatureType } from "../models";
import { QuickAddCreature } from "./quickAddSlice";
import { RootState } from "../store";

const externalCreature = (attributes?: Partial<InitiativeCreatureExternal>): InitiativeCreatureExternal => ({
  initiative: Math.floor(Math.random() * 20) + 1,
  currentHp: 30,
  name: "A monster",
  maxHp: 30,
  ac: Math.floor(Math.random() * 10) + 10,
  type: "monster",
  ...attributes
});

const internalCreature = (creature: InitiativeCreatureExternal, attributes?: Partial<InitiativeCreature>) => ({
  ...creature,
  uuid: expect.any(String),
  order: 0,
  ...attributes
});

const createCreature = (
  attributes?: Partial<InitiativeCreatureExternal>,
  internalAttributes?: Partial<InitiativeCreature>
) => {
  const creature = externalCreature(attributes);

  return [creature, internalCreature(creature, internalAttributes)] as [InitiativeCreatureExternal, InitiativeCreature];
};

const sliceState = (creatures: InitiativeCreature[], currentTurn: number, round: number) => ({
  creatures,
  currentTurn,
  round
});

const [creature1, creature1Internal] = createCreature({ initiative: 20 });
const [creature2, creature2Internal] = createCreature({ initiative: 10 });

const emptyTurnOrder = sliceState([], 0, 0);
const oneCreatureAdded = sliceState([creature1Internal], 0, 0);
const twoCreaturesAdded = sliceState([creature1Internal, creature2Internal], 0, 0);

describe("addCreature", () => {
  const nextState = (
    state: ReturnType<typeof sliceState>,
    creatures: InitiativeCreatureExternal[]
  ): ReturnType<typeof sliceState> => reducer(state, addCreatures(creatures));

  it("can add a creature when none exist", () => {
    expect(nextState(emptyTurnOrder, [creature1])).toEqual(sliceState([creature1Internal], 0, 0));
  });

  it("can add a creature when one already exists", () => {
    expect(nextState(sliceState([creature1Internal], 0, 0), [creature2])).toEqual(twoCreaturesAdded);
  });

  it("can add multiple creatures at once", () => {
    expect(nextState(emptyTurnOrder, [creature1, creature2])).toEqual(twoCreaturesAdded);
  });

  it("inserts creatures in sorted order", () => {
    const [creature3, creature3Internal] = createCreature({ initiative: 25 });
    const [creature4, creature4Internal] = createCreature({ initiative: 15 });
    const [creature5, creature5Internal] = createCreature({ initiative: 5 });

    expect(nextState(twoCreaturesAdded, [creature3, creature4, creature5])).toEqual(
      sliceState([creature3Internal, creature1Internal, creature4Internal, creature2Internal, creature5Internal], 0, 0)
    );
  });

  it("increments order for creatures with the same initiative", () => {
    const [creature1, creature1Internal] = createCreature({ initiative: 20 }, { order: 0 });
    const [creature2, creature2Internal] = createCreature({ initiative: 20 }, { order: 1 });

    expect(nextState(emptyTurnOrder, [creature1, creature2])).toEqual(
      sliceState([creature1Internal, creature2Internal], 0, 0)
    );
  });

  describe("preserving current creature's turn", () => {
    const existingCreature1 = internalCreature(externalCreature({ initiative: 17 }));
    const existingCreature2 = internalCreature(externalCreature({ initiative: 15 }));
    const newCreature = externalCreature({ initiative: 16 });

    it("preserves the turn of the current creature", () => {
      const originalState = sliceState([existingCreature1, existingCreature2], 1, 1);
      const expectedState = sliceState([existingCreature1, internalCreature(newCreature), existingCreature2], 2, 1);

      expect(nextState(originalState, [newCreature])).toEqual(expectedState);
    });

    it("preserves the current turn if it is the top of a round", () => {
      const newCreature = externalCreature({ initiative: 18 });

      const originalState = sliceState([existingCreature1, existingCreature2], 0, 1);
      const expectedState = sliceState([internalCreature(newCreature), existingCreature1, existingCreature2], 1, 1);

      expect(nextState(originalState, [newCreature])).toEqual(expectedState);
    });

    it("does not preserve the turn order if combat has not started", () => {
      const newCreature = externalCreature({ initiative: 18 });

      const originalState = sliceState([existingCreature1, existingCreature2], 0, 0);
      const expectedState = sliceState([internalCreature(newCreature), existingCreature1, existingCreature2], 0, 0);

      expect(nextState(originalState, [newCreature])).toEqual(expectedState);
    });
  });
});

describe("deleteCreature", () => {
  const nextState = (state: ReturnType<typeof sliceState>, index: number): ReturnType<typeof sliceState> =>
    reducer(state, deleteCreature(index));

  it("removes a creature from the initiative order", () => {
    expect(nextState(twoCreaturesAdded, 1)).toEqual(oneCreatureAdded);
  });

  it("removes a creature that is not last from the initiative order", () => {
    const expectedState = sliceState([creature2Internal], 0, 0);

    expect(nextState(twoCreaturesAdded, 0)).toEqual(expectedState);
  });

  it("removes the last creature from the initiative order", () => {
    expect(nextState(oneCreatureAdded, 0)).toEqual(emptyTurnOrder);
  });

  describe("preserving current creature's turn", () => {
    const creature3Internal = internalCreature(externalCreature({ initiative: 9 }));

    it("preserves the turn of the current creature", () => {
      // It's currently creature 2's turn.
      const originalState = sliceState([creature1Internal, creature2Internal, creature3Internal], 1, 1);
      const expectedState = sliceState([creature2Internal, creature3Internal], 0, 1);

      expect(nextState(originalState, 2)).toEqual(expectedState); // remove creature 1 (index of 2 since it just went)
    });

    it("leaves the current turn alone if it is the top of a round", () => {
      const originalState = sliceState([creature1Internal, creature2Internal, creature3Internal], 0, 1);
      const expectedState = sliceState([creature2Internal, creature3Internal], 0, 1);

      expect(nextState(originalState, 0)).toEqual(expectedState);
    });

    it("handles deleting the creature whose turn it is gracefully", () => {
      // It's currently creature 2's turn.
      const originalState = sliceState([creature1Internal, creature2Internal, creature3Internal], 1, 1);
      const expectedState = sliceState([creature1Internal, creature3Internal], 1, 1);

      expect(nextState(originalState, 0)).toEqual(expectedState); // remove creature 1 (index of 2 since it just went)
    });
  });
});

describe("editCreature", () => {
  const nextState = (
    state: ReturnType<typeof sliceState>,
    index: number,
    creature: QuickAddCreature
  ): ReturnType<typeof sliceState> => reducer(Object.assign({}, state), editCreature({ index, creature }));

  const updates = {
    name: "a new name",
    ac: creature1.ac + 1,
    maxHp: creature1.maxHp * 2,
    initiative: creature1.initiative + 5,
    type: "player" as CreatureType,
    quantity: 0
  };

  it("updates the creature's attributes", () => {
    const expectedState = sliceState([{ ...creature1Internal, ...updates }], 0, 0);

    expect(nextState(oneCreatureAdded, 0, updates)).toEqual(expectedState);
  });

  it("updates a creature's attributes after they went in combat", () => {
    // It's currently creature 2's turn
    const originalState = sliceState([creature1Internal, creature2Internal], 1, 1);
    const expectedState = sliceState([{ ...creature1Internal, ...updates }, creature2Internal], 1, 1);

    expect(nextState(originalState, 1, updates)).toEqual(expectedState); // update creature 1
  });

  it("sorts the initiative order again", () => {
    const expectedState = sliceState([{ ...creature2Internal, ...updates }, creature1Internal], 0, 0);

    expect(nextState(twoCreaturesAdded, 1, updates)).toEqual(expectedState);
  });

  it("fixes creatures who have duplicate initiatives", () => {
    const thisUpdates = { ...updates, initiative: creature1.initiative };
    const expectedState = sliceState([creature1Internal, { ...creature2Internal, ...thisUpdates, order: 1 }], 0, 0);

    expect(nextState(twoCreaturesAdded, 1, thisUpdates)).toEqual(expectedState);
  });
});

describe("previous", () => {
  const nextState = (state: ReturnType<typeof sliceState>): ReturnType<typeof sliceState> => reducer(state, previous());

  it("decrements the current turn", () => {
    const middleOfCombat = sliceState([creature1Internal, creature2Internal], 2, 2);
    const expectedState = sliceState([creature1Internal, creature2Internal], 1, 2);

    expect(nextState(middleOfCombat)).toEqual(expectedState);
  });

  it("returns to the end of the previous round if it is the first creature's turn", () => {
    const topOfSecondRound = sliceState([creature1Internal, creature2Internal], 0, 1);
    const expectedState = sliceState([creature1Internal, creature2Internal], 1, 0);

    expect(nextState(topOfSecondRound)).toEqual(expectedState);
  });

  it("does nothing if it is the start of the first round", () => {
    expect(nextState(twoCreaturesAdded)).toEqual(twoCreaturesAdded);
  });
});

describe("next", () => {
  const nextState = (state: ReturnType<typeof sliceState>): ReturnType<typeof sliceState> => reducer(state, next());

  it("increments the current turn", () => {
    const expectedState = sliceState([creature1Internal, creature2Internal], 1, 0);

    expect(nextState(twoCreaturesAdded)).toEqual(expectedState);
  });

  it("goes back to the top of the order for the next round", () => {
    const endOfFirstRound = sliceState([creature1Internal, creature2Internal], 1, 0);
    const expectedState = sliceState([creature1Internal, creature2Internal], 0, 1);

    expect(nextState(endOfFirstRound)).toEqual(expectedState);
  });
});

describe("changeInitiative", () => {
  const nextState = (
    state: ReturnType<typeof sliceState>,
    index: number,
    newInitiative: number | string
  ): ReturnType<typeof sliceState> => reducer(state, changeInitiative({ index, newInitiative: String(newInitiative) }));

  it("assigns the new initiative to the requested creature", () => {
    const expectedState = sliceState(
      [{ ...creature1Internal, initiative: creature1Internal.initiative + 1 }, creature2Internal],
      0,
      0
    );

    expect(nextState(twoCreaturesAdded, 0, creature1.initiative + 1)).toEqual(expectedState);
  });

  it("does nothing if new initiative is invalid", () => {
    const invalidValues = [NaN, Infinity, "invalid"];
    invalidValues.forEach((value) => expect(nextState(twoCreaturesAdded, 0, value)).toEqual(twoCreaturesAdded));
  });

  it("assumes that an empty string means 0", () => {
    const expectedState = sliceState([creature2Internal, { ...creature1Internal, initiative: 0 }], 0, 0);

    expect(nextState(twoCreaturesAdded, 0, "")).toEqual(expectedState);
  });

  it("updates a creature's initiative after they went in combat", () => {
    // It's currently creature 2's turn
    const originalState = sliceState([creature1Internal, creature2Internal], 1, 1);
    const expectedState = sliceState(
      [{ ...creature1Internal, initiative: creature1Internal.initiative + 5 }, creature2Internal],
      1,
      1
    );

    // update creature 1
    expect(nextState(originalState, 1, creature1Internal.initiative + 5)).toEqual(expectedState);
  });

  it("sorts the initiative order again", () => {
    const expectedState = sliceState(
      [{ ...creature2Internal, initiative: creature1Internal.initiative + 1 }, creature1Internal],
      0,
      0
    );

    expect(nextState(twoCreaturesAdded, 1, creature1Internal.initiative + 1)).toEqual(expectedState);
  });

  it("fixes creatures who have duplicate initiatives", () => {
    const expectedState = sliceState(
      [creature1Internal, { ...creature2Internal, initiative: creature1Internal.initiative, order: 1 }],
      0,
      0
    );

    expect(nextState(twoCreaturesAdded, 1, creature1.initiative)).toEqual(expectedState);
  });
});

// Hard to test this; this logic should not exist in reducers anyways
describe("rollAllInitiative", () => {
  it.todo("randomizes the initiative of all monsters");
  it.todo("does not modify initiatives of player type creatures");
  it.todo("sorts the initiative order again");
});

describe("adjustCreatureHealth", () => {
  const [damagedCreature, damagedCreatureInternal] = createCreature({ currentHp: 15 });

  const nextState = (
    state: ReturnType<typeof sliceState>,
    index: number,
    amount: number
  ): ReturnType<typeof sliceState> => reducer(state, adjustCreatureHealth({ index, amount }));

  it("heals the creature by the specified amount if it is positive", () => {
    const currentState = sliceState([damagedCreatureInternal], 0, 0);
    const expectedState = sliceState([{ ...damagedCreatureInternal, currentHp: damagedCreature.currentHp + 5 }], 0, 0);

    expect(nextState(currentState, 0, 5)).toEqual(expectedState);
  });

  it("damages the creature by the specified amount if it is negative", () => {
    const currentState = sliceState([damagedCreatureInternal], 0, 0);
    const expectedState = sliceState([{ ...damagedCreatureInternal, currentHp: damagedCreature.currentHp - 5 }], 0, 0);

    expect(nextState(currentState, 0, -5)).toEqual(expectedState);
  });

  it("cannot modify creature health to be less than zero", () => {
    const currentState = sliceState([damagedCreatureInternal], 0, 0);
    const expectedState = sliceState([{ ...damagedCreatureInternal, currentHp: 0 }], 0, 0);

    expect(nextState(currentState, 0, damagedCreature.maxHp * -2)).toEqual(expectedState);
  });

  it("cannot modify creature health to be above its max hit points", () => {
    const currentState = sliceState([damagedCreatureInternal], 0, 0);
    const expectedState = sliceState([{ ...damagedCreatureInternal, currentHp: damagedCreature.maxHp }], 0, 0);

    expect(nextState(currentState, 0, damagedCreature.maxHp * 2)).toEqual(expectedState);
  });

  it("updates a creature's health after they went in combat", () => {
    const originalState = sliceState([damagedCreatureInternal, creature1Internal], 1, 1);
    const expectedState = sliceState(
      [{ ...damagedCreatureInternal, currentHp: damagedCreature.currentHp + 5 }, creature1Internal],
      1,
      1
    );

    // update creature 1
    expect(nextState(originalState, 1, 5)).toEqual(expectedState);
  });
});

describe("reorderCreature", () => {
  const nextState = (
    state: ReturnType<typeof sliceState>,
    fromIndex: number,
    toIndex: number
  ): ReturnType<typeof sliceState> => reducer(state, reorderCreature({ index: fromIndex, newIndex: toIndex }));

  const [creature3, creature3Internal] = createCreature();
  const threeCreaturesAdded = sliceState([creature1Internal, creature2Internal, creature3Internal], 0, 0);

  it("sets the initiative to that of the creature it was moved onto", () => {
    const expectedState = sliceState(
      [creature2Internal, { ...creature1Internal, initiative: creature2.initiative, order: 1 }],
      0,
      0
    );

    expect(nextState(twoCreaturesAdded, 0, 1)).toEqual(expectedState);
  });

  it("is ordered before the creature it was moved onto if moved sooner in the order", () => {
    const expectedState = sliceState(
      [
        { ...creature2Internal, initiative: creature1.initiative, order: 0 },
        { ...creature1Internal, order: 1 },
        creature3Internal
      ],
      0,
      0
    );

    expect(nextState(threeCreaturesAdded, 1, 0)).toEqual(expectedState);
  });

  it("is ordered after the creature it was moved onto if moved later in the order", () => {
    const expectedState = sliceState(
      [
        creature1Internal,
        { ...creature3Internal, order: 0 },
        { ...creature2Internal, initiative: creature3.initiative, order: 1 }
      ],
      0,
      0
    );

    expect(nextState(threeCreaturesAdded, 1, 2)).toEqual(expectedState);
  });
});

describe("restartEncounter", () => {
  const damagedCreature1Internal = internalCreature(externalCreature({ currentHp: 15, maxHp: 30 }));
  const damagedCreature2Internal = internalCreature(externalCreature({ currentHp: 10, maxHp: 45 }));

  const middleOfCombat = sliceState([damagedCreature1Internal, damagedCreature2Internal], 1, 2);

  it("goes back to the start of first round", () => {
    const newState = reducer(middleOfCombat, restartEncounter());

    expect(newState.currentTurn).toEqual(0);
    expect(newState.round).toEqual(0);
  });

  it("sets the current hit points of all creatures to their hit point maximum", () => {
    const newState = reducer(middleOfCombat, restartEncounter());

    expect(newState.creatures.map((creature) => creature.currentHp)).toEqual([30, 45]);
  });
});

describe("clearEncounter", () => {
  it("removes all creatures from the initiative order", () => {
    const newState = reducer(twoCreaturesAdded, clearEncounter());

    expect(newState.creatures.length).toEqual(0);
  });

  it("goes back to the start of the first round", () => {
    const middleOfCombat = sliceState([creature1Internal, creature2Internal], 1, 2);
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

describe("selectInitiativeCreatures", () => {
  it("returns the list of creatures", () => {
    const creatureList = [internalCreature(externalCreature()), internalCreature(externalCreature())];

    const currentState = {
      initiativeTracker: { creatures: creatureList, currentTurn: 1, round: 2 }
    } as unknown as RootState;

    expect(selectInitiativeCreatures(currentState)).toEqual(creatureList);
  });
});

describe("selectSortedInitiativeCreatures", () => {
  it("returns an ordered list of creatures where the first creature is whose turn it is", () => {
    const secondCreaturesTurn = sliceState([creature1Internal, creature2Internal], 1, 0);

    const currentState = { initiativeTracker: secondCreaturesTurn } as unknown as RootState;

    expect(selectSortedInitiativeCreatures(currentState)).toEqual([creature2Internal, creature1Internal]);
  });
});
