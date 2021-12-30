import React from "react";
import { Button } from "react-bootstrap";
import DisplayInitiative from "../DisplayInitiative";
import { next, selectInitiativeRound, selectInitiativeTurn } from "../redux/initiative-tracker/initiativeTrackerSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";

const RunEncounter: React.FunctionComponent = () => {
  const turn = useAppSelector(selectInitiativeTurn);
  const round = useAppSelector(selectInitiativeRound);

  const dispatch = useAppDispatch();

  return (
    <div>
      <div>Turn: {turn + 1}</div>
      <div>Round: {round + 1}</div>
      <DisplayInitiative></DisplayInitiative>
      <Button onClick={() => dispatch(next())}>Next turn</Button>
    </div>
  );
};

export default RunEncounter;
