import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
import { ulid } from "ulid";

export const ChitEntity = new Entity(
  {
    indexes: {
      chit: {
        pk: {
          field: "pk",
          composite: ["chitId"],
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
      chitId: {
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

      value: {
        type: "number",
        required: true,
      },
    },

    model: {
      version: "1",
      entity: "Chit",
      service: "catan-discord",
    },
  },
  Dynamo.Configuration
);

export type ChitEntityType = EntityItem<typeof ChitEntity>;
