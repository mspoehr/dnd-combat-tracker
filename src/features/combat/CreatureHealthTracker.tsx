import React, { useRef, useState } from "react";
import { Button, Form, Overlay, Popover, Stack } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { adjustCreatureHealth, selectCreatureCurrentHp, selectCreatureMaxHp } from "./initiativeTrackerSlice";

interface Props {
  uuid: string;
}

const CreatureHealthTracker: React.FunctionComponent<Props> = (props) => {
  const target = useRef(null);
  const [showHealth, setShowHealth] = useState(false);
  const [hpAdjustment, _setHpAdjustment] = useState("0");

  const dispatch = useAppDispatch();

  const currentHp = useAppSelector(selectCreatureCurrentHp(props.uuid));
  const maxHp = useAppSelector(selectCreatureMaxHp(props.uuid));

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
    dispatch(adjustCreatureHealth({ uuid: props.uuid, amount: Number(hpAdjustment) }));
    close();
  };

  const damage = () => {
    dispatch(adjustCreatureHealth({ uuid: props.uuid, amount: -Number(hpAdjustment) }));
    close();
  };

  return (
    <>
      <div ref={target} onClick={() => setShowHealth(true)} style={{ minWidth: "110px" }}>
        <div>HP</div>
        <div className="flex-row align-items-center">
          <div className="bg-white p-2 rounded d-inline-block">{currentHp}</div>
          <span className="mx-2">/</span>
          <span>{maxHp}</span>
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
