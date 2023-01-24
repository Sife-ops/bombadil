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

    const canAfford = () => {
      const p = ctx.getPlayer();
      if (building === "settlement") {
        if (p.brick < 1 || p.lumber < 1 || p.grain < 1 || p.wool < 1)
          return false;
      } else {
        if (p.grain < 2 || p.ore < 3) return false;
      }
      return true;
    };

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
          // cannot afford
          (ctx.getRound() > 1 && !canAfford()) ||
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
        const mutations: Promise<any>[] = [
          model.entities.BuildingEntity.create({
            ...coords,
            building,
            gameId: ctx.getGame().gameId,
            playerId: ctx.getPlayer().playerId,
          }).go(),
        ];

        if (ctx.getRound() > 1) {
          const mutation = model.entities.PlayerEntity.update({
            playerId: ctx.getPlayer().playerId,
          });
          if (building === "settlement") {
            mutations.push(
              mutation.subtract({ brick: 1, lumber: 1, grain: 1, wool: 1 }).go()
            );
          } else {
            mutations.push(mutation.subtract({ grain: 2, ore: 3 }).go());
          }
        }

        return {
          mutations,
          response: {},
        };
      },
    };
  },
});
