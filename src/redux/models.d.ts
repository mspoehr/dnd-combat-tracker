export interface UniqueEntity {
  uuid: string;
}

export type UniqueIdType = UniqueEntity['uuid'];

export interface Speed {
  walk: number;
  fly: number;
  swim: number;
}

type CreatureType = 'monster' | 'player';
export interface Creature extends UniqueEntity {
  name: string;
  maxHp: number;
  ac: number;
  speed: Speed;
  type: CreatureType;
}
