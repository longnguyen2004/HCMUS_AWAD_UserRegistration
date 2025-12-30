import { t } from "elysia";

export namespace UserModel {
  export const changeAvatarBody = t.Object({
    source: t.String(),
  });
  export type changeAvatarBody = typeof changeAvatarBody.static;
}
