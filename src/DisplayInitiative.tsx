import React from "react";
import { Button, Table } from "react-bootstrap";

import { useState } from "react";
import QuickAddModal from "./QuickAddModal";
import { useAppDispatch, useAppSelector } from "./redux/store";
import { deleteCreature, selectInitiativeCreatures } from "./redux/initiative-tracker/initiativeTrackerSlice";

const DisplayInitiative: React.FunctionComponent = () => {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const handleClose = () => setQuickAddOpen(false);
  const initiativeCreatures = useAppSelector(selectInitiativeCreatures);

  const dispatch = useAppDispatch();

  return (
    <div>
      <Button variant="outline-primary" size="lg" onClick={() => setQuickAddOpen(true)}>
        Quick Add Character
      </Button>
      <QuickAddModal open={quickAddOpen} close={handleClose} />

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>AC</th>
            <th>Max HP</th>
            <th>Initiative</th>
            <th>Quantity</th>
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
              <td>0</td>
              <td>
                <Button onClick={() => alert("Not implemented yet!")}>Edit</Button>
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
