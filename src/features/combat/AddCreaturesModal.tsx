import React, { KeyboardEventHandler, useEffect, useState } from "react";
import { Button, ButtonGroup, Form, Modal, ToggleButton } from "react-bootstrap";
import { CreatureType } from "../../common/models";
import { addCreatures, InitiativeCreature } from "./initiativeTrackerSlice";

import { v4 as uuidv4 } from "uuid";
import { useAppDispatch } from "../../app/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";
import {
  creatureTypeRadioOptions,
  creatureValid,
  FormInitiativeCreature,
  parseCreature
} from "../../common/creatureHelpers";

const defaultFormCreature = {
  name: "",
  ac: "",
  maxHp: "",
  initiative: "",
  initiativeMod: "",
  type: "monster" as CreatureType,
  quantity: "",
  notes: ""
};
interface AddFormCreature extends Omit<FormInitiativeCreature, "currentHp" | "uuid"> {
  quantity: string;
}

function CreatureRow(props: {
  creature: AddFormCreature;
  validated: boolean;
  index: number;
  changeCreature: (index: number, creature: AddFormCreature) => void;
  removeCreature: (index: number) => void;
  addRowAndFocus: () => void;
}) {
  const keyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (!event.target) {
      return;
    }

    const target = event.target as HTMLInputElement;
    const index = _.indexOf(target.form?.elements, target);

    if (event.key === "Enter" || event.key === "ArrowDown") {
      // TODO: if this is the last row, it would be nice if this created a new row and focused it for us
      (target.form?.elements[index + 9] as HTMLFormElement | undefined)?.focus();
    } else if (event.key === "ArrowUp") {
      (target.form?.elements[index - 9] as HTMLFormElement | undefined)?.focus();
    } else if (event.key === "ArrowRight") {
      (target.form?.elements[index + 1] as HTMLFormElement | undefined)?.focus();
    } else if (event.key === "ArrowLeft") {
      (target.form?.elements[index - 1] as HTMLFormElement | undefined)?.focus();
    }
  };

  const createFormCell = (attr: keyof AddFormCreature, width: string, placeholder: string) => (
    <Form.Control
      type="text"
      isInvalid={props.validated && props.creature[attr] !== "" && isNaN(Number(props.creature[attr]))}
      value={props.creature[attr]}
      style={{ width }}
      placeholder={placeholder}
      onKeyDown={keyDown}
      onChange={(e) => props.changeCreature(props.index, { ...props.creature, [attr]: e.target.value })}
    />
  );

  return (
    <>
      <Form.Control
        type="text"
        isInvalid={
          props.validated && props.creature.name.length === 0 && !_.isEqual(props.creature, defaultFormCreature)
        }
        value={props.creature.name}
        style={{ width: "300px" }}
        autoFocus={props.index === 0}
        placeholder={props.index === 0 ? "Player, monster, object, or effect name" : "Name"}
        onKeyDown={keyDown}
        onChange={(e) => props.changeCreature(props.index, { ...props.creature, name: e.target.value })}
      />
      {createFormCell("maxHp", "75px", "HP")}
      {createFormCell("ac", "100px", "AC")}
      {createFormCell("initiative", "110px", "Initiative")}
      {createFormCell("initiativeMod", "110px", "Init. Mod")}
      {createFormCell("quantity", "110px", "Quantity")}
      <ButtonGroup>
        {creatureTypeRadioOptions.map((radio, idx) => (
          <ToggleButton
            key={idx}
            id={`radio-${props.index}-${idx}`}
            type="radio"
            variant={idx % 2 ? "outline-danger" : "outline-success"}
            name={`radio-${props.index}`}
            value={radio.value}
            checked={props.creature.type === (radio.value as CreatureType)}
            onChange={(e) =>
              props.changeCreature(props.index, { ...props.creature, type: e.currentTarget.value as CreatureType })
            }
          >
            {radio.name}
          </ToggleButton>
        ))}
      </ButtonGroup>
      <Button variant="danger" onClick={() => props.removeCreature(props.index)}>
        <FontAwesomeIcon icon={faTrash} />
      </Button>
    </>
  );
}

interface AddCreatureModalProps {
  open: boolean;
  setClosed: () => void;
}

const AddCreaturesModal: React.FunctionComponent<AddCreatureModalProps> = (props) => {
  const [creatures, setCreatures] = useState<AddFormCreature[]>(new Array(4).fill(defaultFormCreature));
  const [validated, setValidated] = useState(false);

  const dispatch = useAppDispatch();

  const save = () => {
    setValidated(true);

    const filteredCreatures = creatures.filter((creature) => creature !== defaultFormCreature);

    const formValid = (creature: AddFormCreature) =>
      creatureValid(creature) && (creature.quantity === "" || !isNaN(Number(creature.quantity)));
    const valid = filteredCreatures.reduce((allValid, creature) => allValid && formValid(creature), true);
    if (!valid) {
      return;
    }

    const initiativeCreatures = filteredCreatures
      .map((creature) => parseCreature(creature))
      .map((creature) =>
        (new Array(Number(creature.quantity || 1)) as Omit<InitiativeCreature, "uuid">[]).fill({
          ...creature,
          currentHp: creature.maxHp
        })
      )
      .flat()
      .map((creature) => ({ ...creature, uuid: uuidv4() }));

    dispatch(addCreatures(initiativeCreatures));

    props.setClosed();
  };

  const addRow = () => setCreatures([...creatures, defaultFormCreature]);
  const changeCreature = (index: number, creature: AddFormCreature) =>
    setCreatures([...creatures.slice(0, index), creature, ...creatures.slice(index + 1)]);
  const removeCreature = (index: number) => setCreatures([...creatures.slice(0, index), ...creatures.slice(index + 1)]);

  useEffect(() => {
    // Reset the form state after it is closed, but after the modal has finished animating closed
    if (!props.open) {
      setTimeout(() => {
        setCreatures(new Array(4).fill(defaultFormCreature));
        setValidated(false);
      }, 100);
    }
  }, [props.open]);

  return (
    <Form>
      <Modal size="xl" show={props.open} onHide={() => props.setClosed()} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Creatures</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form style={{ display: "grid", gridTemplateColumns: "repeat(8, min-content)", gridGap: "10px" }}>
            <div className="fw-bold">Name</div>
            <div className="fw-bold">Max HP</div>
            <div className="fw-bold">Armor Class</div>
            <div className="fw-bold">Initiative</div>
            <div className="fw-bold">Initiative Mod</div>
            <div className="fw-bold">Quantity</div>
            <div className="fw-bold">Type</div>
            <div /> {/* placeholder for delete button title */}
            {creatures.map((creature, index) => (
              <CreatureRow
                key={index}
                creature={creature}
                validated={validated}
                index={index}
                changeCreature={changeCreature}
                removeCreature={removeCreature}
                addRowAndFocus={addRow}
              />
            ))}
          </Form>
          <Button className="my-2 mx-auto d-block" variant="primary" onClick={addRow}>
            Add Another Creature
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => props.setClosed()}>
            Close
          </Button>
          <Button variant="primary" onClick={save}>
            Add Creatures
          </Button>
        </Modal.Footer>
      </Modal>
    </Form>
  );
};

export default AddCreaturesModal;
