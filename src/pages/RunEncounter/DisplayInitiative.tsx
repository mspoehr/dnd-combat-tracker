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
  rollAllInitiative,
  reorderCreature
} from "../../redux/initiative-tracker/initiativeTrackerSlice";

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
        <CreatureHealthTracker index={props.index} creature={props.creature} />
      </div>
    </div>
  );
}

const DisplayInitiative: React.FunctionComponent = () => {
  const initiativeCreatures = useAppSelector(selectSortedInitiativeCreatures);
  const dispatch = useAppDispatch();

  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    dispatch(reorderCreature({ index: result.source.index, newIndex: result.destination.index }));
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

  return (
    <div>
      <Stack className="my-2" direction="horizontal" gap={2}>
        <Button onClick={() => dispatch(open())}>Quick Add Creature</Button>
        <Button onClick={() => dispatch(rollAllInitiative())}>Roll Initiative</Button>
      </Stack>
      <QuickAddModal />

      <div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {initiativeCreatures.map((creature, index) => (
                  <Draggable key={creature.uuid} draggableId={creature.uuid} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                      >
                        <InitiativeCreature key={creature.uuid} creature={creature} index={index} />
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
