import type { CityModel } from "./city.model.js";
import { City } from "../../db/models/city.model.js";

export abstract class CityService {
  static async getAll() {
    return await City.findAll() satisfies CityModel.cityResponse
  }
}
