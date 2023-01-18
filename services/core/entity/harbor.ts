import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
import { ulid } from "ulid";

export const HarborEntity = new Entity(
  {
    indexes: {
      harbor: {
        pk: {
          field: "pk",
          composite: ["harborId"],
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
      harborId: {
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

      resource: {
        type: ["wool", "grain", "ore", "brick", "lumber", "any"] as const,
        required: true,
      },

      ratio: {
        type: "string",
        required: true,
      },
    },

    model: {
      version: "1",
      entity: "Harbor",
      service: "catan-discord",
    },
  },
  Dynamo.Configuration
);

export type HarborEntityType = EntityItem<typeof HarborEntity>;
