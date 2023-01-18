import { model } from "@bombadil/core/model";

// todo: explicit any
export const handler = async (event: any) => {
  const onboardUser = JSON.parse(event.Records[0].body);

  const user = await model.entities.UserEntity.query
    .user({ userId: onboardUser.id })
    .go()
    .then(({ data }) => data[0]);

  if (!user) {
    await model.entities.UserEntity.create({
      userId: onboardUser.id,
      username: onboardUser.username,
      discriminator: onboardUser.discriminator,
      avatar: onboardUser.avatar,
    }).go();

    console.log("user record created");
  } else {
    const onboardUserFields = {
      username: onboardUser.username,
      discriminator: onboardUser.discriminator,
      avatar: onboardUser.avatar,
    };

    for (const field in onboardUserFields) {
      // todo: no feel like writing good code today
      // @ts-ignore
      if (onboardUserFields[field] !== user[field]) {
        await model.entities.UserEntity.update({
          userId: user.userId,
        })
          .set({
            username: onboardUserFields.username,
            discriminator: onboardUserFields.discriminator,
            avatar: onboardUserFields.avatar,
          })
          .go();

        console.log("user record updated");

        break;
      }
    }
  }

  return {};
};
