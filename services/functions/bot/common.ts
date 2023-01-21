import { UserEntityType } from "@bombadil/core/entity";
import { model } from "@bombadil/core/model";
import { z } from "zod";

export const onboardUser = async (u: UserEntityType & { id: string }) => {
  return model.entities.UserEntity.get({ userId: u.id })
    .go()
    .then((e) => e.data)
    .then(async (user) => {
      if (!user) {
        await model.entities.UserEntity.create({
          userId: u.id,
          username: u.username,
          discriminator: u.discriminator,
          avatar: u.avatar || "",
        }).go();
        return;
      }

      if (
        user.avatar !== u.avatar ||
        user.discriminator !== u.discriminator ||
        user.username !== u.username
      ) {
        await model.entities.UserEntity.update({
          userId: user.userId,
        })
          .set({
            username: u.username,
            discriminator: u.discriminator,
            avatar: u.avatar,
          })
          .go();
      }
    });
};

export const randomNoRepeat = <T>(array: T[]) => {
  let copy = array.slice(0);
  return () => {
    if (copy.length < 1) {
      copy = array.slice(0);
    }
    let index = Math.floor(Math.random() * copy.length);
    let item = copy[index];
    copy.splice(index, 1);
    return item;
  };
};

export interface Coords {
  x: number;
  y: number;
}

export const compareXY = (a: Coords, b: Coords) => a.x === b.x && a.y === b.y;

export interface CoordsPair {
  from: Coords;
  to: Coords;
}

export const compareXYPair = (a: CoordsPair, b: CoordsPair) => {
  if (compareXY(a.from, b.from) && compareXY(a.to, b.to)) return true;
  if (compareXY(a.to, b.from) && compareXY(a.from, b.to)) return true;
  return false;
};

export const adjXY = (coords: Coords) => {
  const evenY = !(coords.y % 2 > 0);
  return [
    {
      x: -1,
      y: 0,
    },
    {
      x: 1,
      y: 0,
    },
    {
      x: evenY ? -1 : 0,
      y: 1,
    },
    {
      x: evenY ? 0 : 1,
      y: 1,
    },
    {
      x: evenY ? -1 : 0,
      y: -1,
    },
    {
      x: evenY ? 0 : 1,
      y: -1,
    },
  ];
};

export const envSchema = z.object({
  PUBLIC_KEY: z.string(),
  ONBOARD_QUEUE: z.string(),
  WEB_URL: z.string(),
});

export const eventSchema = z.object({
  body: z.string(),
  headers: z.object({
    "x-signature-ed25519": z.string(),
    "x-signature-timestamp": z.string(),
  }),
});

/*
 * body
 */

export const memberSchema = z.object({
  user: z.object({
    id: z.string(),
  }),
});

export const optionSchema = z.object({
  name: z.string(),
  type: z.number(),
  value: z.union([z.string(), z.number()]).optional(),
  options: z.array(z.any()).optional(),
});
export type OptionSchema = z.infer<typeof optionSchema>;

export const usersSchema = z.record(
  z.object({
    avatar: z.string(),
    discriminator: z.string(),
    id: z.string(),
    username: z.string(),
  })
);
type UsersSchema = z.infer<typeof usersSchema>;

export const dataSchema = z.object({
  name: z.string(),
  options: z.array(optionSchema).optional(),
  type: z.number(),
});
type DataSchema = z.infer<typeof dataSchema>;

export const bodySchema = z.object({
  channel_id: z.string(),
  data: dataSchema,
  member: memberSchema,
  type: z.number(),
});

/*
 * functions
 */

export const rollOne = (): number => {
  return [1, 2, 3, 4, 5, 6][Math.floor(Math.random() * 6)];
};

export const rollTwo = (): number => {
  return rollOne() + rollOne();
};

export const genericResponse = (content: string) => {
  return {
    type: 4,
    data: {
      content,
    },
  };
};

export const genericResult = (
  content: string,
  mutations: Promise<any>[] = []
) => {
  return {
    mutations: mutations,
    response: genericResponse(content),
  };
};

// todo: sus
export const getResolvedUser = (users: UsersSchema, userId: string) => {
  const user = users[userId];
  if (!user) throw new Error("missing user");
  return user;
};
