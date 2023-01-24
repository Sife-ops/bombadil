import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
import { ulid } from "ulid";

export const PlayerEntity = new Entity(
  {
    indexes: {
      player: {
        pk: {
          field: "pk",
          composite: ["playerId"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },

      user_: {
        collection: "user",
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["userId"],
        },
        sk: {
          field: "gsi1sk",
          composite: ["gameId"],
        },
      },

      game_: {
        collection: "game",
        index: "gsi2",
        pk: {
          field: "gsi2pk",
          composite: ["gameId"],
        },
        sk: {
          field: "gsi2sk",
          composite: ["userId"],
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
          composite: [],
        },
      },
    },

    attributes: {
      playerId: {
        type: "string",
        required: true,
        default: () => ulid(),
      },

      userId: {
        type: "string",
        required: true,
      },

      gameId: {
        type: "string",
        required: true,
      },

      playerIndex: {
        type: "number",
        required: true,
        default: 0,
      },

      color: {
        type: "string",
        required: true,
      },

      grain: {
        type: "number",
        required: true,
        default: 0,
      },

      wool: {
        type: "number",
        required: true,
        default: 0,
      },

      brick: {
        type: "number",
        required: true,
        default: 0,
      },

      lumber: {
        type: "number",
        required: true,
        default: 0,
      },

      ore: {
        type: "number",
        required: true,
        default: 0,
      },

      victory: {
        type: "number",
        required: true,
        default: 0,
      },
    },

    model: {
      version: "1",
      entity: "Player",
      service: "catan-discord",
    },
  },
  Dynamo.Configuration
);

export type PlayerEntityType = EntityItem<typeof PlayerEntity>;
