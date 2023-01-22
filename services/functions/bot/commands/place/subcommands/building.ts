import { Command } from "@bombadil/bot/runner";
import { Ctx } from "@bombadil/bot/ctx";
import { model } from "@bombadil/core/model";
import { genericResponse, genericResult } from "@bombadil/bot/common";
import { compareXY, Coords } from "@bombadil/lib";

export const building = (building: "settlement" | "city"): Command => ({
  handler: async (ctx: Ctx) => {
    const coords = ctx.getMapIndexOrThrow<Coords>(
      "intersection",
      (ctx.getOptionValue("ind") as number) - 1 // todo: 0 start index doesn't work
    );

    return {
      bot: async () => {
        if (
          // exceeds first-two-round limit
          (ctx.getRound() < 2 &&
            ctx.getPlayerBuildings().length > ctx.getRound()) ||
          // not connected to road
          (ctx.getRound() > 1 &&
            !ctx
              .getPlayerRoads()
              .reduce<Coords[]>(
                (a, c) => [...a, { ...c.from }, { ...c.to }],
                []
              )
              .find((c) => compareXY(c, coords))) ||
          // too close to another building
          ctx
            .getBuildings()
            .some(
              (building) =>
                !!ctx
                  .getMapAdjacent("intersection", coords)
                  .find((intersection) => compareXY(intersection, building))
            ) ||
          // building already exists
          ctx.hasBuilding(coords)
        ) {
          return genericResult("illegal move");
        }

        return {
          mutations: [ctx.enqueueBot()],
          response: genericResponse(`place ${building}`),
        };
      },

      consumer: async () => {
        return {
          mutations: [
            model.entities.BuildingEntity.create({
              ...coords,
              building,
              gameId: ctx.getGame().gameId,
              playerId: ctx.getPlayer().playerId,
            }).go(),
          ],
          response: {},
        };
      },
    };
  },
});
