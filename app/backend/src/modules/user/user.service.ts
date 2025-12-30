import { UserModel } from "./user.model.js";
import cloudinaryService from "../../lib/cloudinary.js";
import { db } from "../../db/db.js";

export abstract class UserService {
  static async changeAvatar(
    body: UserModel.changeAvatarBody,
    id: string,
  ): Promise<{ url: string }> {
    const res = await cloudinaryService.uploadAndAutoCropSquare(
      body.source,
      500,
      {
        folder: "avatars",
      },
    );

    const url = res.secureUrl ?? res.url;

    await db.query(`UPDATE "user" u SET image = :url WHERE u.id::text = :id`, {
      replacements: { url, id },
    });

    return {
      url,
    };
  }
}
