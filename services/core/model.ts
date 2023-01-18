import * as Entity from "./entity";
import { Service } from "electrodb";

export const model = new Service({
  UserEntity: Entity.UserEntity,
  BuildingEntity: Entity.BuildingEntity,
  ChitEntity: Entity.ChitEntity,
  GameEntity: Entity.GameEntity,
  HarborEntity: Entity.HarborEntity,
  MapEntity: Entity.MapEntity,
  PlayerEntity: Entity.PlayerEntity,
  RoadEntity: Entity.RoadEntity,
  TerrainEntity: Entity.TerrainEntity,
  ConnectionEntity: Entity.ConnectionEntity,
});

export interface GameCollection {
  BuildingEntity: Entity.BuildingEntityType[];
  ChitEntity: Entity.ChitEntityType[];
  GameEntity: Entity.GameEntityType[];
  HarborEntity: Entity.HarborEntityType[];
  PlayerEntity: Entity.PlayerEntityType[];
  RoadEntity: Entity.RoadEntityType[];
  TerrainEntity: Entity.TerrainEntityType[];
  ConnectionEntity: Entity.ConnectionEntityType[];
}
