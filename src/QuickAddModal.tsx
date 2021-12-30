import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { addCreature, InitiativeCreature } from "./redux/initiative-tracker/initiativeTrackerSlice";
import { useAppDispatch } from "./redux/store";

export default function QuickAddModal(props: { open: boolean, close: () => void}) {

    const [name, setName] = useState("");
    const [ac, setAC] = useState(0);
    const [maxHp, setMaxHP] = useState(0);
    const [initiative, setInitiative] = useState(0);
    const [quantity, setQuantity] = useState(0);
    
    const dispatch = useAppDispatch();
    const save = () => {
        const creature: InitiativeCreature = {
            name,
            ac,
            maxHp,
            initiative
        };

        dispatch(addCreature(creature));
        props.close();
    }

    return (<Modal show={props.open} onHide={props.close}>
        <Modal.Header closeButton>
            <Modal.Title>Create New Character</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Row>
                    <Col>
                        <Form.Group className="mv-3" controlId="exampleForm.ControlTextArea1">
                            <Form.Label>Name</Form.Label>
                            <Form.Control value={name} onChange={(e) => { setName(e.target.value)}} type="text"></Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mv-3" controlId="exampleForm.ControlTextArea1">
                            <Form.Label>Armor Class</Form.Label>
                            <Form.Control value={ac} onChange={(e) => {setAC(Number(e.target.value))}} type="number"></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mv-3" controlId="exampleForm.ControlTextArea1">
                            <Form.Label>Max HP(Optional)</Form.Label>
                            <Form.Control value={maxHp} onChange={(e) => {setMaxHP(Number(e.target.value))}} type="number"></Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mv-3" controlId="exampleForm.ControlTextArea1">
                            <Form.Label>Initiative(Optional)</Form.Label>
                            <Form.Control value={initiative} onChange={(e) => {setInitiative(Number(e.target.value))}} type="number"></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mv-3" controlId="exampleForm.ControlTextArea1">
                            <Form.Label>Quantity(Optional)</Form.Label>
                            <Form.Control value={quantity} onChange={(e) => {setQuantity(Number(e.target.value))}} type="number"></Form.Control>
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
    </Modal>)
}