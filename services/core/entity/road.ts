import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
import { ulid } from "ulid";

export const RoadEntity = new Entity(
  {
    indexes: {
      road: {
        pk: {
          field: "pk",
          composite: ["roadId"],
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
          composite: ["x1", "y1", "x2", "y2"],
        },
      },

      player_: {
        collection: "player",
        index: "gsi3",
        pk: {
          field: "gsi3pk",
          composite: ["playerId"],
        },
        sk: {
          field: "gsi3sk",
          composite: ["roadId"],
        },
      },
    },

    attributes: {
      roadId: {
        type: "string",
        required: true,
        default: () => ulid(),
      },

      gameId: {
        type: "string",
        required: true,
      },

      playerId: {
        type: "string",
        required: true,
      },

      x1: {
        type: "number",
        required: true,
      },

      y1: {
        type: "number",
        required: true,
      },

      x2: {
        type: "number",
        required: true,
      },

      y2: {
        type: "number",
        required: true,
      },
    },

    model: {
      version: "1",
      entity: "Road",
      service: "catan-discord",
    },
  },
  Dynamo.Configuration
);

export type RoadEntityType = EntityItem<typeof RoadEntity>;
