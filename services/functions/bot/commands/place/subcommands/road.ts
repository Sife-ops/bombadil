import { Command } from "@bombadil/bot/runner";
import { model } from "@bombadil/core/model";
import { genericResponse, genericResult } from "@bombadil/bot/common";
import { compareXY, Coords } from "@bombadil/lib";

export const road: Command = {
  handler: async (ctx) => {
    const from = ctx.getMapIndexOrThrow<Coords>(
      "intersection",
      (ctx.getOptionValue("ind1") as number) - 1
    );
    const to = ctx.getMapIndexOrThrow<Coords>(
      "intersection",
      (ctx.getOptionValue("ind2") as number) - 1
    );

    return {
      bot: async () => {
        if (
          // exceeds first-two-round limit
          (ctx.getRound() < 2 &&
            ctx.getPlayerRoads().length > ctx.getRound()) ||
          // road not connected to player's building or road
          ![
            ...ctx.getPlayerBuildings(),
            ...ctx
              .getPlayerRoads()
              .reduce<Coords[]>(
                (a, c) => [...a, { ...c.from }, { ...c.to }],
                []
              ),
          ].some((coords) => !![from, to].find((c) => compareXY(c, coords))) ||
          // coords not adjacent
          !ctx
            .getMapAdjacent("intersection", from)
            .find((intersection) => compareXY(intersection, to)) ||
          // road already exists
          ctx.hasRoad({ from, to })
        ) {
          return genericResult("illegal move");
        }

        return {
          mutations: [ctx.enqueueBot()],
          response: genericResponse("place road"),
        };
      },

      consumer: async () => {
        return {
          mutations: [
            model.entities.RoadEntity.create({
              x1: from.x,
              y1: from.y,
              x2: to.x,
              y2: to.y,
              gameId: ctx.getGame().gameId,
              playerId: ctx.getPlayer().playerId,
            }).go(),
          ],
          response: {},
        };
      },
    };
  },
};
