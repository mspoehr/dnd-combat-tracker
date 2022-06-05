import { InitiativeCreature } from "../features/combat/initiativeTrackerSlice";
import { CreatureType } from "./models";

export const creatureTypeRadioOptions = [
  { name: "Player", value: "player" },
  { name: "Monster", value: "monster" }
];

type Stringify<T> = {
  [K in keyof T]: string;
};

export type FormInitiativeCreature = Stringify<InitiativeCreature> & { type: CreatureType };

export const creatureValid = (creature: Omit<FormInitiativeCreature, "currentHp" | "uuid">): boolean =>
  typeof creature.name == "string" &&
  creature.name.length > 0 &&
  (creature.ac === "" || !isNaN(Number(creature.ac))) &&
  (creature.maxHp === "" || !isNaN(Number(creature.maxHp))) &&
  (creature.initiative === "" || !isNaN(Number(creature.initiative))) &&
  (creature.initiativeMod === "" || !isNaN(Number(creature.initiativeMod)));

export const parseCreature = <T extends Partial<FormInitiativeCreature>>(
  creature: T
): T & Pick<InitiativeCreature, "ac" | "maxHp" | "initiative" | "initiativeMod" | "currentHp"> => ({
  ...creature,
  ac: Number(creature.ac),
  maxHp: Number(creature.maxHp),
  initiative: Number(creature.initiative),
  initiativeMod: Number(creature.initiativeMod),
  currentHp: Number(creature.currentHp)
});
