import React from "react";

import { Alert, Button, Col, Container, Row, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../app/store";
import { selectAllEncounters } from "./encountersSlice";

function EmptyPlaceholder() {
  return <Alert variant="info">There are no encounters yet. Create one now!</Alert>;
}

function EncounterList() {
  const encounters = useAppSelector(selectAllEncounters);
  const encounterElements = encounters.map((encounter) => <div key={encounter.uuid}>{encounter.name}</div>);

  return <div>{encounters.length === 0 ? <EmptyPlaceholder /> : encounterElements}</div>;
}

const MyEncounters: React.FunctionComponent = () => (
  <div>
    <Container fluid className="my-3">
      <Row>
        <Col>
          <h1>My Encounters</h1>
        </Col>
        <Col md="auto">
          <Stack direction="horizontal" gap={2}>
            <Link to="/encounters/quick/run">
              <Button variant="outline-primary">Quick Run Encounter</Button>
            </Link>
            <Button variant="primary" onClick={() => alert("Not implemented yet!")}>
              Add Encounter
            </Button>
          </Stack>
        </Col>
      </Row>
      <Row>
        <EncounterList />
      </Row>
    </Container>
  </div>
);

export default MyEncounters;
