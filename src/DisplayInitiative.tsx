import React from "react";
import { Button, Table } from "react-bootstrap";

import QuickAddModal from "./QuickAddModal";
import { open, edit } from "./redux/initiative-tracker/quickAddSlice";
import { useAppDispatch, useAppSelector } from "./redux/store";
import { deleteCreature, selectInitiativeCreatures } from "./redux/initiative-tracker/initiativeTrackerSlice";

const DisplayInitiative: React.FunctionComponent = () => {
  const initiativeCreatures = useAppSelector(selectInitiativeCreatures);

  const dispatch = useAppDispatch();

  return (
    <div>
      <Button variant="outline-primary" size="lg" onClick={() => dispatch(open())}>
        Quick Add Character
      </Button>
      <QuickAddModal />

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>AC</th>
            <th>Max HP</th>
            <th>Initiative</th>
          </tr>
        </thead>
        <tbody>
          {initiativeCreatures.map((creature, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{creature.name}</td>
              <td>{creature.ac}</td>
              <td>{creature.maxHp}</td>
              <td>{creature.initiative}</td>
              <td>
                <Button onClick={() => dispatch(edit({ index, creature }))}>Edit</Button>
              </td>
              <td>
                <Button variant="danger" onClick={() => dispatch(deleteCreature(index))}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DisplayInitiative;
