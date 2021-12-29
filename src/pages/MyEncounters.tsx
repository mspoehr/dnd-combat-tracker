import { Alert, Button, Col, Container, Row, Stack } from "react-bootstrap";
import { selectAllEncounters } from "../redux/data/encountersSlice";
import { useAppSelector } from "../redux/store";

function EmptyPlaceholder() {
  return <Alert variant="info">There are no encounters yet. Create one now!</Alert>;
}

function EncounterList() {
  const encounters = useAppSelector(selectAllEncounters);
  const encounterElements = encounters.map((encounter) => <div>{encounter.name}</div>);

  return <div>{encounters.length === 0 ? <EmptyPlaceholder /> : encounterElements}</div>;
}

export default function MyEncounters() {
  return (
    <div>
      <Container fluid>
        <Row>
          <Col>
            <h1>My Encounters</h1>
          </Col>
          <Col md="auto">
            <Stack direction="horizontal" gap={2}>
              <Button variant="outline-primary">Quick Run Encounter</Button>
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
}
