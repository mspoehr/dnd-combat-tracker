export interface UniqueEntity {
  uuid: string;
}

export type UniqueIdType = UniqueEntity["uuid"];

export interface Speed {
  walk: number;
  fly: number;
  swim: number;
}

export type CreatureType = "monster" | "player";
export interface Creature extends UniqueEntity {
  name: string;
  maxHp: number;
  ac: number;
  // TODO: use this later.
  // speed: Speed;
  type: CreatureType;
}
