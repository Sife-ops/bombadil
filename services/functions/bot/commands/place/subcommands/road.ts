import { Command } from "@bombadil/bot/runner";
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

    const canAfford = () => {
      const p = ctx.getPlayer();
      if (p.brick < 1 || p.lumber < 1) return false;
      return true;
    };

    return {
      bot: async () => {
        if (
          // exceeds first-two-round limit
          (ctx.getRound() < 2 &&
            ctx.getPlayerRoads().length > ctx.getRound()) ||
          // cannot afford
          (ctx.getRound() > 1 && !canAfford()) ||
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
        const mutations: Promise<any>[] = [
          // create road
          ctx.model.entities.RoadEntity.create({
            x1: from.x,
            y1: from.y,
            x2: to.x,
            y2: to.y,
            gameId: ctx.getGame().gameId,
            playerId: ctx.getPlayer().playerId,
          }).go(),
        ];

        // subtract cost
        if (ctx.getRound() > 1) {
          mutations.push(
            ctx.model.entities.PlayerEntity.update({
              playerId: ctx.getPlayer().playerId,
            })
              .subtract({ brick: 1, lumber: 1 })
              .go()
          );
        }

        return {
          mutations,
          response: {},
        };
      },
    };
  },
};
