import React from "react";
import { Button, Col, Container, Dropdown, DropdownButton, Row, Stack } from "react-bootstrap";
import DisplayInitiative from "./DisplayInitiative";
import {
  next,
  previous,
  selectInitiativeRound,
  selectInitiativeTurn,
  restartEncounter,
  clearEncounter,
  removeAllMonsters
} from "./initiativeTrackerSlice";
import { useAppDispatch, useAppSelector } from "../../app/store";

function Counter(props: { text: string; value: number }) {
  return (
    <div className="text-center fw-bold">
      <div>{props.text}</div>
      <div style={{ fontSize: "1.5em" }}>{props.value + 1}</div>
    </div>
  );
}

function InitiativeControlBar() {
  const turn = useAppSelector(selectInitiativeTurn);
  const round = useAppSelector(selectInitiativeRound);

  const dispatch = useAppDispatch();

  return (
    <Container fluid className="p-2 mb-4" style={{ borderBottom: "2px solid black" }}>
      <Row className="align-items-center">
        <Col>
          <h1 className="fw-bold">Quick Encounter</h1>
        </Col>
        <Col>
          <Stack direction="horizontal" gap={4}>
            <Counter text="ROUND" value={round} />
            <Counter text="TURN" value={turn} />
          </Stack>
        </Col>
        <Col md="auto">
          <Stack direction="horizontal" gap={2}>
            <Button variant="outline-primary" onClick={() => dispatch(previous())}>
              Previous turn
            </Button>
            <Button onClick={() => dispatch(next())}>Next turn</Button>
            <DropdownButton title="More" variant="secondary">
              <Dropdown.Item as="button" onClick={() => dispatch(restartEncounter())}>
                Restart encounter
              </Dropdown.Item>
              <Dropdown.Item as="button" onClick={() => dispatch(clearEncounter())}>
                Clear initiative order
              </Dropdown.Item>
              <Dropdown.Item as="button" onClick={() => dispatch(removeAllMonsters())}>
                Remove all monsters
              </Dropdown.Item>
            </DropdownButton>
          </Stack>
        </Col>
      </Row>
    </Container>
  );
}

const RunEncounter: React.FunctionComponent = () => (
  <div>
    <InitiativeControlBar></InitiativeControlBar>
    <DisplayInitiative></DisplayInitiative>
  </div>
);

export default RunEncounter;
