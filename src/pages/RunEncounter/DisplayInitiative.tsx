import React from "react";
import { Button, Form, Stack } from "react-bootstrap";

import QuickAddModal from "./QuickAddModal";
import { open, edit } from "../../redux/initiative-tracker/quickAddSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  changeInitiative,
  deleteCreature,
  InitiativeCreature as InitiativeCreatureType,
  selectSortedInitiativeCreatures,
  rollAllInitiative
} from "../../redux/initiative-tracker/initiativeTrackerSlice";

import "./DisplayInitiative.css";

function InitiativeCreature(props: { creature: InitiativeCreatureType; index: number }) {
  const dispatch = useAppDispatch();

  return (
    <div className="initiative-creature">
      <div>
        <div>
          <div>INITIATIVE</div>
          <Form.Control
            type="text"
            value={props.creature.initiative ?? ""}
            style={{ width: "100px" }}
            className="text-center"
            onChange={(e) => dispatch(changeInitiative({ index: props.index, newInitiative: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex-grow-1 text-start">
        <div className="fw-bold" style={{ fontSize: "1.5em" }}>
          {props.creature.name}
        </div>
        <div>AC {props.creature.ac}</div>

        <Stack direction="horizontal" gap={2}>
          <Button onClick={() => dispatch(edit({ index: props.index, creature: props.creature }))}>Edit</Button>
          <Button variant="danger" onClick={() => dispatch(deleteCreature(props.index))}>
            Delete
          </Button>
        </Stack>
      </div>
      <div>
        <div>
          {props.creature.currentHp} / {props.creature.maxHp}
        </div>
      </div>
    </div>
  );
}

const DisplayInitiative: React.FunctionComponent = () => {
  const initiativeCreatures = useAppSelector(selectSortedInitiativeCreatures);
  const dispatch = useAppDispatch();

  return (
    <div>
      <Stack direction="horizontal" gap={2}>
        <Button onClick={() => dispatch(open())}>Quick Add Character</Button>
        <Button onClick={() => dispatch(rollAllInitiative())}>Roll Initiative</Button>
      </Stack>
      <QuickAddModal />

      <div>
        {initiativeCreatures.map((creature, index) => (
          <InitiativeCreature key={creature.uuid} creature={creature} index={index} />
        ))}
      </div>
    </div>
  );
};

export default DisplayInitiative;
