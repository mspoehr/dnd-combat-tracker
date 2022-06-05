import _ from "lodash";
import { useEffect, useState } from "react";
import { Form, Modal, Button, ToggleButton, ButtonGroup } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../app/store";
import {
  creatureTypeRadioOptions,
  creatureValid,
  FormInitiativeCreature,
  parseCreature
} from "../../common/creatureHelpers";
import { CreatureType } from "../../common/models";
import { editCreature, InitiativeCreature, selectCreatureByUuid } from "./initiativeTrackerSlice";

interface EditCreatureModalProps {
  setClosed: () => void;
  editUuid: string | null;
}

const EditCreatureModal: React.FunctionComponent<EditCreatureModalProps> = (props) => {
  const storeCreature = useAppSelector(selectCreatureByUuid(props.editUuid ?? ""));

  const open = Boolean(props.editUuid !== null);
  const [validated, setValidated] = useState(false);
  const [formCreature, setFormCreature] = useState<FormInitiativeCreature | undefined>(undefined);
  useEffect(() => {
    setFormCreature(_.mapValues(storeCreature, (value) => String(value)) as FormInitiativeCreature);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.editUuid]);

  const dispatch = useAppDispatch();

  const createFormCell = (
    label: string,
    attr: keyof InitiativeCreature,
    placeholder: string,
    validator?: (value: string | undefined) => boolean
  ) => {
    const value = _.get(formCreature, attr, "");
    return (
      <Form.Group>
        <Form.Label className="fw-bold">{label}</Form.Label>
        <Form.Control
          type="text"
          isInvalid={validated && (validator ? validator(value) : isNaN(Number(value)) && value !== "")}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setFormCreature({ ...(formCreature as FormInitiativeCreature), [attr]: e.target.value })}
        />
      </Form.Group>
    );
  };

  const save = () => {
    setValidated(true);

    if (formCreature === undefined || !creatureValid(formCreature)) {
      return;
    }

    if (props.editUuid) {
      dispatch(editCreature({ ...parseCreature(formCreature), uuid: props.editUuid }));
    }

    props.setClosed();
  };

  useEffect(() => {
    // Reset the form state after it is closed, but after the modal has finished animating closed
    if (!open) {
      setTimeout(() => {
        setValidated(false);
      }, 100);
    }
  }, [open]);

  return (
    <Form>
      <Modal size="sm" show={open} onHide={() => props.setClosed()} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit {storeCreature?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {createFormCell(
            "Name",
            "name",
            "Player, monster, object, or effect name",
            (name) => name === undefined || name.length === 0
          )}
          {createFormCell("Max HP", "maxHp", "Max HP")}
          {createFormCell("Armor Class", "ac", "AC")}
          {createFormCell("Initiative Mod", "initiativeMod", "Initiative Modifier")}
          <Form.Group>
            <Form.Label className="d-block fw-bold">Type</Form.Label>
            <ButtonGroup>
              {creatureTypeRadioOptions.map((radio, idx) => (
                <ToggleButton
                  key={idx}
                  id={`radio-${props.editUuid}-${idx}`}
                  type="radio"
                  variant={idx % 2 ? "outline-danger" : "outline-success"}
                  name={`radio-${props.editUuid}`}
                  value={radio.value}
                  checked={_.get(formCreature, "type") === (radio.value as CreatureType)}
                  onChange={(e) =>
                    setFormCreature({
                      ...(formCreature as FormInitiativeCreature),
                      type: e.target.value as CreatureType
                    })
                  }
                >
                  {radio.name}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => props.setClosed()}>
            Close
          </Button>
          <Button variant="primary" onClick={save}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Form>
  );
};

export default EditCreatureModal;
