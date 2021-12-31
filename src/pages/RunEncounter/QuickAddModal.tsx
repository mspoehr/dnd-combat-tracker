import React from "react";
import { Button, ButtonGroup, Col, Form, Modal, Row, ToggleButton } from "react-bootstrap";
import { addCreature, InitiativeCreature, editCreature } from "../../redux/initiative-tracker/initiativeTrackerSlice";
import { CreatureType } from "../../redux/models";
import {
  changeName,
  changeAc,
  changeMaxHp,
  changeInitiative,
  selectAc,
  selectInitiative,
  selectMaxHp,
  selectName,
  close,
  selectOpen,
  selectEditingMode,
  selectEditIndex,
  selectType,
  changeType
} from "../../redux/initiative-tracker/quickAddSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

const QuickAddModal: React.FunctionComponent = () => {
  const name = useAppSelector(selectName);
  const ac = useAppSelector(selectAc);
  const maxHp = useAppSelector(selectMaxHp);
  const initiative = useAppSelector(selectInitiative);
  const editMode = useAppSelector(selectEditingMode);
  const editIndex = useAppSelector(selectEditIndex);
  const type = useAppSelector(selectType);
  const dispatch = useAppDispatch();
  const radios = [
    { name: "Player", value: "player" },
    { name: "Monster", value: "monster" }
  ];
  const save = () => {
    const creature: InitiativeCreature = {
      name,
      ac,
      maxHp,
      initiative,
      currentHp: maxHp,
      type: type
    };

    if (!editMode) {
      dispatch(addCreature(creature));
    } else {
      dispatch(editCreature({ index: editIndex, creature }));
    }
    dispatch(close());
  };

  return (
    <Modal size="lg" show={useAppSelector(selectOpen)} onHide={() => dispatch(close())} centered>
      <Modal.Header closeButton>
        <Modal.Title>Quick Add Creature</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col>
              <Form.Group className="mv-3" controlId="exampleForm.ControlTextArea1">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  value={name}
                  onChange={(e) => {
                    dispatch(changeName(e.target.value));
                  }}
                  type="text"
                ></Form.Control>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mv-3" controlId="exampleForm.ControlTextArea1">
                <Form.Label>Armor Class</Form.Label>
                <Form.Control
                  value={ac}
                  onChange={(e) => {
                    dispatch(changeAc(Number(e.target.value)));
                  }}
                  type="text"
                ></Form.Control>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mv-3" controlId="exampleForm.ControlTextArea1">
                <Form.Label>Max HP(Optional)</Form.Label>
                <Form.Control
                  value={maxHp}
                  onChange={(e) => {
                    dispatch(changeMaxHp(Number(e.target.value)));
                  }}
                  type="text"
                ></Form.Control>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mv-3" controlId="exampleForm.ControlTextArea1">
                <Form.Label>Initiative(Optional)</Form.Label>
                <Form.Control
                  value={initiative}
                  onChange={(e) => {
                    dispatch(changeInitiative(Number(e.target.value)));
                  }}
                  type="text"
                ></Form.Control>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mv-3" controlId="exampleForm.ControlTextArea1">
                <Form.Label>Creature Type</Form.Label>
                <ButtonGroup>
                  {radios.map((radio, idx) => (
                    <ToggleButton
                      key={idx}
                      id={`radio-${idx}`}
                      type="radio"
                      variant={idx % 2 ? "outline-danger" : "outline-success"}
                      name="radio"
                      value={radio.value}
                      checked={type === (radio.value as CreatureType)}
                      onChange={(e) => dispatch(changeType(e.currentTarget.value as CreatureType))}
                    >
                      {radio.name}
                    </ToggleButton>
                  ))}
                </ButtonGroup>
              </Form.Group>
            </Col>
          </Row>
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
  );
};

export default QuickAddModal;
