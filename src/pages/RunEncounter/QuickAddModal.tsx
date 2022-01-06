import React, { useState } from "react";
import { Button, ButtonGroup, Col, Form, InputGroup, Modal, Row, ToggleButton } from "react-bootstrap";
import { addCreatures, editCreature } from "../../redux/initiative-tracker/initiativeTrackerSlice";
import {
  changeName,
  changeAc,
  changeMaxHp,
  changeInitiative,
  close,
  changeType,
  changeQuantity,
  selectCreatures,
  QuickAddCreature,
  selectEditMode,
  selectModalOpen,
  selectEditIndex,
  addRow
} from "../../redux/initiative-tracker/quickAddSlice";
import { CreatureType } from "../../redux/models";
import { useAppDispatch, useAppSelector } from "../../redux/store";

function AddNewCreature(props: {
  currentCreature: QuickAddCreature;
  editMode: boolean;
  validated: boolean;
  index: number;
}) {
  const dispatch = useAppDispatch();

  const radios = [
    { name: "Player", value: "player" },
    { name: "Monster", value: "monster" }
  ];
  return (
    <Row>
      <Col>
        <Form.Group className="mv-3">
          <Form.Label>Name</Form.Label>
          <InputGroup hasValidation>
            <Form.Control
              isInvalid={props.validated && props.currentCreature.name === ""}
              value={props.currentCreature.name}
              onChange={(e) => {
                dispatch(changeName({ name: e.target.value, index: props.index }));
              }}
              type="text"
            ></Form.Control>
          </InputGroup>
        </Form.Group>
      </Col>
      <Col>
        <Form.Group className="mv-3">
          <Form.Label>Armor Class</Form.Label>
          <Form.Control
            value={props.currentCreature.ac}
            onChange={(e) => {
              dispatch(changeAc({ ac: Number(e.target.value), index: props.index }));
            }}
            type="text"
          ></Form.Control>
        </Form.Group>
      </Col>
      <Col>
        <Form.Group className="mv-3">
          <Form.Label>Max HP</Form.Label>
          <Form.Control
            value={props.currentCreature.maxHp}
            onChange={(e) => {
              dispatch(changeMaxHp({ maxHp: Number(e.target.value), index: props.index }));
            }}
            type="text"
          ></Form.Control>
        </Form.Group>
      </Col>
      <Col>
        <Form.Group className="mv-3">
          <Form.Label>Initiative</Form.Label>
          <Form.Control
            value={props.currentCreature.initiative}
            onChange={(e) => {
              dispatch(changeInitiative({ initiative: Number(e.target.value), index: props.index }));
            }}
            type="text"
          ></Form.Control>
        </Form.Group>
      </Col>
      {!props.editMode && (
        <Col>
          <Form.Group className="mv-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              value={props.currentCreature.quantity}
              onChange={(e) => {
                dispatch(changeQuantity({ quantity: Number(e.target.value), index: props.index }));
              }}
              type="text"
            ></Form.Control>
          </Form.Group>
        </Col>
      )}

      <Col>
        <Form.Group className="mv-3">
          <Form.Label>Creature Type</Form.Label>
          <ButtonGroup>
            {radios.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${props.index}-${idx}`}
                type="radio"
                variant={idx % 2 ? "outline-danger" : "outline-success"}
                name={`radio-${props.index}`}
                value={radio.value}
                checked={props.currentCreature.type === (radio.value as CreatureType)}
                onChange={(e) =>
                  dispatch(changeType({ type: e.currentTarget.value as CreatureType, index: props.index }))
                }
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
        </Form.Group>
      </Col>
    </Row>
  );
}

const QuickAddModal: React.FunctionComponent = () => {
  const creatures = useAppSelector(selectCreatures);
  const dispatch = useAppDispatch();
  const editIndex = useAppSelector(selectEditIndex);
  const editMode = useAppSelector(selectEditMode);
  const [validated, setValidated] = useState(false);

  const save = () => {
    setValidated(true);

    const filteredCreatures = creatures.filter(
      (creature) =>
        !(
          creature.name === "" &&
          creature.ac === 0 &&
          creature.maxHp === 0 &&
          creature.initiative === 0 &&
          creature.quantity === 1
        )
    );

    const valid = filteredCreatures.reduce((valid, creature) => valid && creature.name !== "", true);
    if (!valid) {
      return;
    }

    const initiativeCreatures = filteredCreatures
      .map((creature) => ({ ...creature, currentHp: creature.maxHp }))
      .map((creature) => new Array(creature.quantity).fill(creature))
      .flat();

    if (!editMode) {
      dispatch(addCreatures(initiativeCreatures));
    } else {
      dispatch(editCreature({ index: editIndex, creature: creatures[0] }));
    }
    dispatch(close());
  };

  return (
    <Form>
      <Modal size="lg" show={useAppSelector(selectModalOpen)} onHide={() => dispatch(close())} centered>
        <Modal.Header closeButton>
          <Modal.Title>Quick Add Creature</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {creatures.map((creature, index) => (
              <AddNewCreature
                key={index}
                currentCreature={creature}
                editMode={editMode}
                validated={validated}
                index={index}
              ></AddNewCreature>
            ))}
            {!editMode && (
              <Button className="my-2" variant="primary" onClick={() => dispatch(addRow())}>
                Add Row
              </Button>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => dispatch(close())}>
            Close
          </Button>
          <Button variant="primary" onClick={save}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Form>
  );
};

export default QuickAddModal;
