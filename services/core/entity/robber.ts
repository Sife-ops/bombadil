import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
import { ulid } from "ulid";

export const RobberEntity = new Entity(
  {
    indexes: {
      robber: {
        pk: {
          field: "pk",
          composite: ["robberId"],
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
      robberId: {
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
    },

    model: {
      version: "1",
      entity: "Robber",
      service: "catan-discord",
    },
  },
  Dynamo.Configuration
);

export type RobberEntityType = EntityItem<typeof RobberEntity>;
