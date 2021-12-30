import React, { useRef, useState } from "react";
import { Button, Form, Overlay, Popover, Stack } from "react-bootstrap";
import { InitiativeCreature, adjustCreatureHealth } from "../../redux/initiative-tracker/initiativeTrackerSlice";
import { useAppDispatch } from "../../redux/store";

interface Props {
  creature: InitiativeCreature;
  index: number;
}

const CreatureHealthTracker: React.FunctionComponent<Props> = (props) => {
  const target = useRef(null);
  const [showHealth, setShowHealth] = useState(false);
  const [hpAdjustment, _setHpAdjustment] = useState("0");

  const dispatch = useAppDispatch();

  const setHpAdjustment = (value: string) => {
    if (isNaN(Number(value)) && value !== "") {
      return;
    }

    _setHpAdjustment(value === "" ? "" : value);
  };

  const close = () => {
    _setHpAdjustment("0");
    setShowHealth(false);
  };

  const heal = () => {
    dispatch(adjustCreatureHealth({ index: props.index, amount: Number(hpAdjustment) }));
    close();
  };

  const damage = () => {
    dispatch(adjustCreatureHealth({ index: props.index, amount: -Number(hpAdjustment) }));
    close();
  };

  return (
    <>
      <div ref={target} onClick={() => setShowHealth(true)} style={{ minWidth: "110px" }}>
        <div>HP</div>
        <div className="flex-row align-items-center">
          <div className="bg-white p-2 rounded d-inline-block">{props.creature.currentHp}</div>
          <span className="mx-2">/</span>
          <span>{props.creature.maxHp}</span>
        </div>
      </div>
      <Overlay rootClose={true} target={target.current} show={showHealth} placement="right" onHide={close}>
        <Popover>
          <Stack direction="vertical" gap={2}>
            <Button variant="success" onClick={heal}>
              Heal
            </Button>
            <Form.Control value={hpAdjustment} type="text" onChange={(e) => setHpAdjustment(e.target.value)} />
            <Button variant="danger" onClick={damage}>
              Damage
            </Button>
          </Stack>
        </Popover>
      </Overlay>
    </>
  );
};
export default CreatureHealthTracker;
