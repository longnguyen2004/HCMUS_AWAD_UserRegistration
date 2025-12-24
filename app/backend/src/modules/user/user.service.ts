import { status } from "elysia";
import { AuthService } from "../../lib/auth.js";
import { UserModel } from "./user.model.js";

export abstract class UserService {
  static async modifyUser(
    userId: string,
    body: UserModel.modifyBody,
  ): Promise<UserModel.modifyResponse> {
    const user = await AuthService.api.getUser({ query: { id: userId } });
    if (!user) throw status(404, { message: "User not found" });

    const updated = await AuthService.api.updateUser({
      query: { id: userId },
      body: {
        image: body.image,
        name: body.name,
        phone: body.phone,
      },
    }) as Partial<UserModel.modifyResponse>;

    return {
      id: userId,
      name: updated?.name ?? body.name ?? undefined,
      image: updated?.image ?? body.image ?? undefined,
      phone: updated?.phone ?? body.phone ?? undefined,
    };
  }
}
