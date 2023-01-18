import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
//

export const ConnectionEntity = new Entity(
  {
    indexes: {
      connection: {
        pk: {
          field: "pk",
          composite: ["connectionId"],
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
          composite: ["clientId"],
        },
      },
    },

    attributes: {
      connectionId: {
        type: "string",
        required: true,
      },

      clientId: {
        type: "string",
        required: true,
      },

      gameId: {
        type: "string",
        required: true,
      },
    },

    model: {
      version: "1",
      entity: "Connection",
      service: "catan-discord",
    },
  },
  Dynamo.Configuration
);

export type ConnectionEntityType = EntityItem<typeof ConnectionEntity>;
