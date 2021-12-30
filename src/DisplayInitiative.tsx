import React from "react";
import { Button, Table } from "react-bootstrap";

import { useState } from "react";
import QuickAddModal from "./QuickAddModal";
import { useAppSelector } from "./redux/store";
import { selectSortedInitiativeCreatures } from "./redux/initiative-tracker/initiativeTrackerSlice";

const DisplayInitiative: React.FunctionComponent = () => {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const handleClose = () => setQuickAddOpen(false);
  const initiativeCreatures = useAppSelector(selectSortedInitiativeCreatures);

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
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DisplayInitiative;
