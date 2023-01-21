import { yellow } from "./yellow";
import { red } from "./red";
import { blue } from "./blue";
import { green } from "./green";

export interface Road {
  roadId: string;
  gameId: string;
  userId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Coords {
  x: number;
  y: number;
}

interface Node {
  coords: Coords;
  neighbors: Coords[];
}

const isSameCoords = (a: Coords, b: Coords) => {
  if (a.x === b.x && a.y === b.y) return true;
  return false;
};

const roadsWithCoords = (coords: Coords) => (road: Road) => {
  if (road.x1 === coords.x && road.y1 === coords.y) {
    return true;
  }
  if (road.x2 === coords.x && road.y2 === coords.y) {
    return true;
  }
  return false;
};

const longestPlayerRoad = (roads: Road[]) => {
  const coords = roads.reduce<Array<Coords>>((a, c) => {
    return [...a, { x: c.x1, y: c.y1 }, { x: c.x2, y: c.y2 }];
  }, []);

  let traversed: Road[] = [];
  let visited: Node[] = [];
  let network: Node[] = [];
  let networks: Node[][] = [];

  const buildNetwork = (coords: Coords, prev: Coords | null) => {
    if (prev) {
      const found = roads
        .filter(roadsWithCoords(coords))
        .filter(roadsWithCoords(prev));
      traversed = [...traversed, ...found];
    }

    const neighbors = roads
      .filter(roadsWithCoords(coords))
      .reduce<Array<Coords>>((a, c) => {
        return [...a, { x: c.x1, y: c.y1 }, { x: c.x2, y: c.y2 }];
      }, [])
      .filter((c) => !isSameCoords(c, coords));

    const cur = {
      coords,
      neighbors,
    };

    visited = [...visited, cur];
    network = [...network, cur];

    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      if (neighbor) {
        const isVisited = visited.find((v) => isSameCoords(v.coords, neighbor));
        if (!isVisited) {
          buildNetwork(neighbor, coords);
        } else {
          const found = roads
            .filter(roadsWithCoords(coords))
            .filter(roadsWithCoords(neighbor));
          if (!traversed.find((t) => t.roadId === found[0].roadId)) {
            traversed = [...traversed, ...found];
          }
        }
      }
    }
  };

  while (traversed.length < roads.length) {
    network = [];
    const unvisited = coords.find(
      (c) => !visited.find((v) => isSameCoords(v.coords, c))
    );
    if (unvisited) {
      buildNetwork(unvisited, null);
      networks = [...networks, network];
    }
  }

  const longestNetworkRoad = (network: Node[]) => {
    const coordsWithRoads = network
      .map((n) => n.coords)
      .reduce<Array<Array<Coords>>>(
        (a, c) => {
          const r = roads.filter(roadsWithCoords({ x: c.x, y: c.y }));
          a[r.length - 1].push(c);
          return a;
        },
        [[], [], []]
      );

    let startingCoords: Coords[] = [];
    if (coordsWithRoads[0].length > 0) {
      startingCoords = coordsWithRoads[0];
    } else if (coordsWithRoads[2].length > 0) {
      startingCoords = coordsWithRoads[2];
    } else {
      startingCoords = coordsWithRoads[1];
    }

    const traverse = (
      cur: Coords | null | undefined,
      prev: Coords | null = null,
      visited: Coords[] = []
    ): number => {
      if (cur === undefined) return 0;
      if (cur === null) return 1;

      const node = network.find((n) => isSameCoords(n.coords, cur));
      if (!node) throw new Error("missing node");

      const next = node.neighbors
        .filter((n) => {
          if (prev && isSameCoords(n, prev)) return false;
          return true;
        })
        .map((n) => {
          const found = visited.find((v) => isSameCoords(v, n));
          if (found) {
            const node = network.find((n) => isSameCoords(n.coords, cur));
            if (!node) throw new Error("missing node");

            const unvisited = node.neighbors.filter((n) => {
              if (isSameCoords(n, cur)) return false;
              if (visited.find((v) => isSameCoords(v, n))) return false;
              return true;
            });
            if (unvisited.length < 1) return null;
          }
          return n;
        });

      const a = traverse(next[0], cur, [...visited, cur]);
      const b = traverse(next[1], cur, [...visited, cur]);
      const c = traverse(next[2], cur, [...visited, cur]);
      const longest = Math.max(a, b, c);

      return prev ? longest + 1 : longest;
    };

    return Math.max(...startingCoords.map((s) => traverse(s)));
  };

  return Math.max(...networks.map((n) => longestNetworkRoad(n)));
};

const n = longestPlayerRoad(green);
console.log(n);
