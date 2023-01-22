import * as Entity from "@bombadil/services/core/entity";
import Sockette from "sockette";
import _ from "lodash";
import { GameCollection } from "@bombadil/services/core/model";
import { adjXY, compareXY, Coords } from "@bombadil/lib";
import { ulid } from "ulid";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const useGame = () => {
  const clientId = ulid();
  const { gameId } = useParams();

  const [ws, setWs] = useState<Sockette>();

  const [gameData, setGameData] = useState<{
    gameCollection: GameCollection;
    users: Entity.UserEntityType[];
  }>();

  const [hexes, setHexes] = useState<JSX.Element[]>();
  const [chits, setChits] = useState<JSX.Element[]>();
  const [harbors, setHarbors] = useState<JSX.Element[]>();
  const [jetties, setJetties] = useState<JSX.Element[]>();
  const [settlements, setSettlements] = useState<JSX.Element[]>();
  const [roads, setRoads] = useState<JSX.Element[]>();
  const [robbers, setRobbers] = useState<JSX.Element[]>();
  const [players, setPlayers] = useState<JSX.Element[]>();

  const updateGameData = () => {
    fetch(import.meta.env.VITE_API_URL + "/game", {
      method: "POST",
      body: JSON.stringify({ gameId }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.ok) throw new Error("no game data");
        setGameData(res.data);
      });
  };

  useEffect(() => {
    console.log(import.meta.env.VITE_API_URL);

    const ws = new Sockette(import.meta.env.VITE_WS_API_URL, {
      timeout: 5e3,
      maxAttempts: 10,
      onopen: (e) => {
        console.log("Connected!", e);
        setWs(ws);
        ws.json({
          action: "game",
          data: { gameId, clientId },
        });
      },
      onmessage: (e) => {
        console.log("Received:", e);
        const parsedData = JSON.parse(e.data);
        switch (parsedData.action) {
          case "update":
            updateGameData();
            break;
          default:
            break;
        }
      },
      onreconnect: (e) => console.log("Reconnecting...", e),
      onmaximum: (e) => console.log("Stop Attempting!", e),
      onclose: (e) => console.log("Closed!", e),
      onerror: (e) => console.log("Error:", e),
    });

    updateGameData();
  }, []);

  useEffect(() => {
    if (!!ws) {
      const reconnect = setInterval(() => {
        console.log("ping");
        ws.json({ action: "ping" });
      }, 60000);
      return () => clearInterval(reconnect);
    }
  }, [ws]);

  useEffect(() => {
    if (gameData) {
      const g = gameData.gameCollection;
      const map = JSON.parse(g.GameEntity[0].map) as any[][];
      const flatMap = map
        .map((row, iRow) =>
          row.map((col, iCol) => ({
            ...col,
            x: iCol,
            y: iRow,
          }))
        )
        .reduce((a, c) => {
          return [...a, ...c];
        }, []);

      setHexes(
        [
          ...flatMap.filter((e) => ["ocean", "harbor"].includes(e.type)),
          ...g.TerrainEntity,
        ]
          .map(translate)
          .map(mapHexes)
      );
      setChits(g.ChitEntity.map(translate).map(mapChits));
      setRobbers(g.RobberEntity.map(translate).map(mapRobbers));
      setRoads(g.RoadEntity.map(mapRoads(g.PlayerEntity)));
      setSettlements(
        g.BuildingEntity.map(translate).map(
          mapBuildings("settlement")(g.PlayerEntity)
        )
      );
      setHarbors(g.HarborEntity.map(translate).map(mapHarbors));
      setJetties(flatMap.filter((e) => _.has(e, "harbor")).map(mapJetties));
      setPlayers(g.PlayerEntity.map(mapPlayers(gameData.users)));
    }
  }, [gameData]);

  return {
    hexes,
    chits,
    robbers,
    harbors,
    jetties,
    roads,
    settlements,
    players,

    clientId,
    gameId,
    ws,
    gameData,
  };
};

function translate<T extends Coords>(c: T) {
  let x = c.x * 10;
  if (c.y % 2 !== 0) {
    x = x + 5;
  }
  return {
    ...c,
    x,
    y: c.y * 9,
  };
}

const mapHexes = ({ x, y, terrain }: Entity.TerrainEntityType) => (
  <g transform={`translate(${x}, ${y})`} key={`x${x}y${y}`}>
    <polygon
      stroke="#000000"
      strokeWidth="0.5"
      style={{ fill: resourceColor(terrain) }}
      points="5,-9 -5,-9 -10,0 -5,9 5,9 10,0"
    />
  </g>
);

// todo: mapBuildings
const mapBuildings =
  (building: "city" | "settlement") =>
  (players: Entity.PlayerEntityType[]) =>
  (b: Entity.BuildingEntityType) => {
    const { x, y } = b;
    const color =
      players.find((p) => p.playerId === b.playerId)?.color || "white";
    return (
      <g transform={`translate(${x}, ${y})`} key={`x${x}y${y}`}>
        <polygon
          stroke="#000000"
          strokeWidth="0.5"
          style={{ fill: color }}
          points={
            building === "settlement"
              ? "0,-2 2,0 2,2 -2,2 -2,0"
              : "-1,-2 0,0 2,0 2,2 -2,2 -2,0"
          }
        />
      </g>
    );
  };

const mapRoads =
  (players: Entity.PlayerEntityType[]) => (road: Entity.RoadEntityType) => {
    const a = translate({ x: road.x1, y: road.y1 });
    const b = translate({ x: road.x2, y: road.y2 });
    const color =
      players.find((p) => p.playerId === road.playerId)?.color || "white";
    return (
      <g key={road.roadId}>
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          strokeWidth="2"
          style={{ stroke: color }}
        />
      </g>
    );
  };

const mapChits = ({ x, y, value }: Entity.ChitEntityType) => (
  <g transform={`translate(${x}, ${y})`} key={`x${x}y${y}`}>
    <circle cx={0} cy={0} r={3} style={{ fill: "black" }} />
    <text fill="white" fontSize={4} x={-1} y={1}>
      {value}
    </text>
  </g>
);

const mapRobbers = ({ x, y }: Entity.RobberEntityType) => (
  <g transform={`translate(${x}, ${y})`} key={`x${x}y${y}`}>
    <circle cx={0} cy={0} r={3} style={{ fill: "black" }} />
  </g>
);

const mapHarbors = ({ x, y, resource }: Entity.HarborEntityType) => (
  <g transform={`translate(${x}, ${y})`} key={`x${x}y${y}`}>
    <polygon
      stroke="#000000"
      strokeWidth="0.5"
      style={{ fill: resourceColor(resource) }}
      points="4,-4 -4,-4 -4,4 4,4"
    />
  </g>
);

const mapJetties = ({ x, y, harbor }: Coords & { harbor: Coords }) => {
  const h = translate(harbor);

  const corner = [
    { x: 5, y: -9 },
    { x: 10, y: 0 },
    { x: 5, y: 9 },
    { x: -5, y: 9 },
    { x: -10, y: 0 },
    { x: -5, y: -9 },
  ][adjXY(harbor).findIndex((i) => compareXY(i, { x, y }))];

  return (
    <g transform={`translate(${h.x}, ${h.y})`} key={`x${x}y${y}`}>
      <line
        x1={0}
        y1={0}
        x2={corner.x}
        y2={corner.y}
        strokeWidth="0.5"
        style={{
          stroke: "#000000",
        }}
      />
    </g>
  );
};

const mapPlayers = (users: Entity.UserEntityType[]) => {
  // console.log(users);
  return (player: Entity.PlayerEntityType) => {
    // console.log(player)
    // const playerUser = {
    //   ...player,
    //   user: users.find((u) => u.userId === player.userId)!,
    // };
    return (
      <div key={player.playerId}>
        <div>
          {/* {playerUser.user.username}#{playerUser.user.discriminator} */}
          {JSON.stringify(player)}
        </div>
      </div>
    );
  };
};

const resourceColor = (t?: string) => {
  switch (t) {
    case "fields":
    case "grain":
      return "wheat";
    case "pasture":
    case "wool":
      return "springgreen";
    case "desert":
      return "sandybrown";
    case "hills":
    case "brick":
      return "firebrick";
    case "forest":
    case "lumber":
      return "forestgreen";
    case "mountains":
    case "ore":
      return "slategray";
    case "any":
      return "white";
    default:
      return "blue";
  }
};
