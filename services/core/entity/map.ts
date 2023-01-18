import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
//

export const MapEntity = new Entity(
  {
    indexes: {
      map: {
        pk: {
          field: "pk",
          composite: ["mapId"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
    },

    model: {
      version: "1",
      entity: "Map",
      service: "catan-discord",
    },

    attributes: {
      mapId: {
        type: "string",
        required: true,
      },

      data: {
        type: "string",
        required: true,
      },
    },
  },
  Dynamo.Configuration
);

export type MapEntityType = EntityItem<typeof MapEntity>;
