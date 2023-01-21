// TODO: MOVE THIS

import { Coords } from "./common";

export interface CoordsPair {
  from: Coords;
  to: Coords;
}

export const compareXY = (a: Coords, b: Coords) => a.x === b.x && a.y === b.y;

export const compareXYPair = (a: CoordsPair, b: CoordsPair) => {
  if (compareXY(a.from, b.from) && compareXY(a.to, b.to)) return true;
  if (compareXY(a.to, b.from) && compareXY(a.from, b.to)) return true;
  return false;
};

export const adjXY = (coords: Coords) => {
  const evenY = !(coords.y % 2 > 0);
  return [
    {
      x: evenY ? 0 : 1,
      y: -1,
    },
    {
      x: 1,
      y: 0,
    },
    {
      x: evenY ? 0 : 1,
      y: 1,
    },
    {
      x: evenY ? -1 : 0,
      y: 1,
    },
    {
      x: -1,
      y: 0,
    },
    {
      x: evenY ? -1 : 0,
      y: -1,
    },
  ];
};
