import type { BusStopModel } from "./busstop.model.js";
import { BusStop } from "../../db/models/busstop.model.js";
import { Op, type WhereOptions } from "sequelize";
import { status } from "elysia";

const BUSSTOP_PER_PAGE = 10;

export abstract class BusStopService {
  static async search(body: BusStopModel.searchBody) {
    const page = body.page ?? 1;
    const limit = BUSSTOP_PER_PAGE;
    const offset = (page - 1) * limit;
    const where: WhereOptions = {};
    if (body.name) {
      where.name = { [Op.iLike]: `%${body.name}%` };
    }
    const { count, rows } = await BusStop.findAndCountAll({
      where,
      limit,
      offset,
      attributes: ["id", "name"],
    });
    return {
      data: rows,
      total: count,
      page,
      per_page: limit,
    } satisfies BusStopModel.searchResponse;
  }

  static async get(body: BusStopModel.getBody) {
    const busStop = await BusStop.findByPk(body.id, {
      attributes: ["id", "name"],
    });
    if (!busStop)
      throw status(404, {
        message: "Bus stop not found",
      } satisfies BusStopModel.notFound);
    return busStop satisfies BusStopModel.getResponse;
  }

  static async create(body: BusStopModel.createBody) {
    const busStop = await BusStop.create({
      name: body.name,
      cityId: body.cityId,
    });
    return busStop satisfies BusStopModel.createResponse;
  }
}
