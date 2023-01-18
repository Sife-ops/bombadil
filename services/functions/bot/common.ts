import { z } from "zod";

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

// todo: sus
export const getResolvedUser = (users: UsersSchema, userId: string) => {
  const user = users[userId];
  if (!user) throw new Error("missing user");
  return user;
};
