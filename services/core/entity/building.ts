import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
import { ulid } from "ulid";

export const BuildingEntity = new Entity(
  {
    indexes: {
      building: {
        pk: {
          field: "pk",
          composite: ["buildingId"],
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

      player_: {
        collection: "player",
        index: "gsi3",
        pk: {
          field: "gsi3pk",
          composite: ["playerId"],
        },
        sk: {
          field: "gsi3sk",
          composite: ["buildingId"],
        },
      },
    },

    attributes: {
      buildingId: {
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

      x: {
        type: "number",
        required: true,
      },

      y: {
        type: "number",
        required: true,
      },

      building: {
        type: ["settlement", "city"] as const,
        required: true,
      },
    },

    model: {
      version: "1",
      entity: "Building",
      service: "catan-discord",
    },
  },
  Dynamo.Configuration
);

export type BuildingEntityType = EntityItem<typeof BuildingEntity>;
