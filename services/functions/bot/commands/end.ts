import { Command } from "../runner";
import { adjXY, compareXY } from "@bombadil/lib";

import {
  genericResponse,
  genericResult,
  rollTwo,
  terrainResource,
} from "@bombadil/bot/common";

export const end: Command = {
  handler: async (ctx) => {
    const nextPlayerIndex =
      ctx.getPlayer().playerIndex < ctx.getPlayers().length - 1
        ? ctx.getPlayer().playerIndex + 1
        : 0;

    return {
      bot: async () => {
        if (ctx.getRound() < 2) {
          if (
            ctx.getPlayerBuildings().length < ctx.getRound() + 1 ||
            ctx.getPlayerRoads().length < ctx.getRound() + 1
          ) {
            return genericResult("must place a settlement and road");
          }
        }

        return {
          mutations: [ctx.enqueueBot()],
          response: genericResponse(
            `<@${ctx.getUserId()}> ended their turn, it is <@${
              ctx.getPlayer(nextPlayerIndex).userId
            }>'s turn`
          ),
        };
      },

      consumer: async () => {
        const nextTurnRound =
          ctx.getPlayer().playerIndex < ctx.getPlayers().length - 1
            ? ctx.getGame().round
            : ctx.getGame().round + 1;

        console.log("nextTurnRound", nextTurnRound);

        let mutations: Promise<any>[] = [
          ctx.model.entities.GameEntity.update({
            channelId: ctx.getChannelId(),
            gameId: ctx.getGame().gameId,
          })
            .set({
              playerIndex: nextPlayerIndex,
              round: nextTurnRound,
            })
            .go(),
        ];

        if (nextTurnRound < 2) {
          return {
            mutations,
            response: {},
          };
        }

        const roll = rollTwo();
        console.log("roll", roll);
        if (roll === 7) {
          const t = ctx.getGameCollection().TerrainEntity;
          const r = t[Math.floor(Math.random() * t.length)];
          const rb = ctx.getGameCollection().RobberEntity[0];
          mutations.push(
            ctx.model.entities.RobberEntity.update({
              robberId: rb.robberId,
            })
              .set({ x: r.x, y: r.y })
              .go()
          );
        } else {
          // distribute resources
          mutations.push(
            ...ctx
              .getGameCollection()
              .ChitEntity.filter((chit) => chit.value === roll)
              .map((chit) => {
                const { terrain } = ctx
                  .getGameCollection()
                  .TerrainEntity.find((t) => compareXY(t, chit))!;
                const buildings = ctx
                  .getBuildings()
                  .filter(
                    (building) =>
                      !!adjXY(chit).find((adj) => compareXY(adj, building))
                  );
                return {
                  ...chit,
                  terrain,
                  buildings,
                };
              })
              .map(terrainResource)
              .reduce<Promise<any>[]>((a, c) => {
                if (c.buildings.length < 1) return a;
                return [
                  ...a,
                  ...c.buildings.map((b) => {
                    return ctx.model.entities.PlayerEntity.update({
                      playerId: b.playerId,
                    })
                      .add({ [c.resource]: b.building === "city" ? 2 : 1 })
                      .go();
                  }),
                ];
              }, [])
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
