import React from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { addCreature, InitiativeCreature } from "./redux/initiative-tracker/initiativeTrackerSlice";
import {
  changeName,
  changeAc,
  changeMaxHp,
  changeInitiative,
  changeQuantity,
  selectAc,
  selectInitiative,
  selectMaxHp,
  selectName,
  selectQuantity,
  setInitialState
} from "./redux/initiative-tracker/quickAddSlice";
import { useAppDispatch, useAppSelector } from "./redux/store";

interface QuickAddModalProps {
  open: boolean;
  close: () => void;
}

const QuickAddModal: React.FunctionComponent<QuickAddModalProps> = (props) => {
  const name = useAppSelector(selectName);
  const ac = useAppSelector(selectAc);
  const maxHp = useAppSelector(selectMaxHp);
  const initiative = useAppSelector(selectInitiative);
  const quantity = useAppSelector(selectQuantity);
  const dispatch = useAppDispatch();
  const save = () => {
    const creature: InitiativeCreature = {
      name,
      ac,
      maxHp,
      initiative
    };

    dispatch(addCreature(creature));

    dispatch(setInitialState());
    props.close();
  };

  // const reset = () => {};

  return (
    <Modal show={props.open} onHide={props.close}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Character</Modal.Title>
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
                  type="number"
                ></Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mv-3" controlId="exampleForm.ControlTextArea1">
                <Form.Label>Max HP(Optional)</Form.Label>
                <Form.Control
                  value={maxHp}
                  onChange={(e) => {
                    dispatch(changeMaxHp(Number(e.target.value)));
                  }}
                  type="number"
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
                  type="number"
                ></Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mv-3" controlId="exampleForm.ControlTextArea1">
                <Form.Label>Quantity(Optional)</Form.Label>
                <Form.Control
                  value={quantity}
                  onChange={(e) => {
                    dispatch(changeQuantity(Number(e.target.value)));
                  }}
                  type="number"
                ></Form.Control>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.close}>
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
