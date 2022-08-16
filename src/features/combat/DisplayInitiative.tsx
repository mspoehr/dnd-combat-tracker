import React, { useState } from "react";
import { Button, Form, Stack } from "react-bootstrap";

import AddCreaturesModal from "./AddCreaturesModal";
import { useAppDispatch, useAppSelector } from "../../app/store";
import {
  changeInitiative,
  deleteCreature,
  rollAllInitiative,
  reorderCreature,
  selectSortedCreatureUuids,
  selectCreatureByUuid,
  copyCreature
} from "./initiativeTrackerSlice";

import "./DisplayInitiative.css";
import CreatureHealthTracker from "./CreatureHealthTracker";
import {
  DragDropContext,
  Draggable,
  DraggingStyle,
  Droppable,
  DropResult,
  NotDraggingStyle
} from "react-beautiful-dnd";
import EditCreatureModal from "./EditCreatureModal";
import { v4 as uuidv4 } from "uuid";

function InitiativeCreature(props: { uuid: string; edit: (uuid: string) => void }) {
  const dispatch = useAppDispatch();
  const creature = useAppSelector(selectCreatureByUuid(props.uuid));

  return (
    <div className="initiative-creature">
      <div>
        <div>
          <div>INITIATIVE</div>
          <Form.Control
            type="text"
            value={creature?.initiative ?? ""}
            style={{ width: "100px" }}
            className="text-center"
            onChange={(e) => dispatch(changeInitiative({ uuid: props.uuid, newInitiative: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex-grow-1 text-start">
        <div className="fw-bold" style={{ fontSize: "1.5em" }}>
          {creature?.name}
        </div>
        <div>AC {creature?.ac}</div>
        {creature?.initiativeMod !== undefined && <div>Init. Mod {creature.initiativeMod}</div>}

        <Stack direction="horizontal" gap={2}>
          <Button onClick={() => props.edit(props.uuid)}>Edit</Button>
          {creature && (
            <Button onClick={() => dispatch(copyCreature({ srcUuid: creature.uuid, copyUuid: uuidv4() }))}>Copy</Button>
          )}
          <Button variant="danger" onClick={() => dispatch(deleteCreature(props.uuid))}>
            Delete
          </Button>
        </Stack>
      </div>
      <div>
        <CreatureHealthTracker uuid={props.uuid} />
      </div>
    </div>
  );
}

const DisplayInitiative: React.FunctionComponent = () => {
  const creatureUuids = useAppSelector(selectSortedCreatureUuids);
  const dispatch = useAppDispatch();

  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    dispatch(
      reorderCreature({
        srcUuid: creatureUuids[result.source.index],
        destUuid: creatureUuids[result.destination.index]
      })
    );
  };

  const getItemStyle = (
    isDragging: boolean,
    draggableStyle: NotDraggingStyle | DraggingStyle | undefined
  ): React.CSSProperties => ({
    userSelect: "none",
    marginBottom: "1rem",
    ...draggableStyle,

    // must come after ...draggableStyle
    opacity: isDragging ? 0.5 : 1
  });

  const [addCreaturesOpen, setAddCreaturesOpen] = useState(false);
  const [editCreatureUuid, setEditCreatureUuid] = useState<string | null>(null);

  return (
    <div>
      <Stack className="my-2" direction="horizontal" gap={2}>
        <Button onClick={() => setAddCreaturesOpen(true)}>Add Creatures</Button>
        <Button onClick={() => dispatch(rollAllInitiative())}>Roll Initiative</Button>
      </Stack>
      <AddCreaturesModal open={addCreaturesOpen} setClosed={() => setAddCreaturesOpen(false)} />
      <EditCreatureModal editUuid={editCreatureUuid} setClosed={() => setEditCreatureUuid(null)} />

      <div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {creatureUuids.map((uuid, index) => (
                  <Draggable key={uuid} draggableId={uuid} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                      >
                        <InitiativeCreature key={uuid} uuid={uuid} edit={(uuid) => setEditCreatureUuid(uuid)} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default DisplayInitiative;
