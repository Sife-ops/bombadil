import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
import { ulid } from "ulid";

export const TerrainEntity = new Entity(
  {
    indexes: {
      terrain: {
        pk: {
          field: "pk",
          composite: ["terrainId"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      game_: {
        collection: "game",
        index: "gsi2",
        pk: {
          field: "gsi2pk",
          composite: ["gameId"],
        },
        sk: {
          field: "gsi2sk",
          composite: ["x", "y"],
        },
      },
    },

    attributes: {
      terrainId: {
        type: "string",
        required: true,
        default: () => ulid(),
      },

      gameId: {
        type: "string",
        required: true,
      },

      x: {
        type: "number",
        required: true,
      },

      y: {
        type: "number",
        required: true,
      },

      terrain: {
        type: [
          "pasture",
          "fields",
          "mountains",
          "hills",
          "forest",
          "desert",
        ] as const,
        required: true,
      },
    },

    model: {
      version: "1",
      entity: "Terrain",
      service: "catan-discord",
    },
  },
  Dynamo.Configuration
);

export type TerrainEntityType = EntityItem<typeof TerrainEntity>;
