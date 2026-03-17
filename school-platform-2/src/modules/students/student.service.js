const { BaseService } = require("../../common/base/Service");
const { AppError } = require("../../errors/AppError");
const { cacheDelByPrefix, cacheDel } = require("../../cache/redis");
const { publishEvent } = require("../../messaging/rabbitmq");
const crypto = require("crypto");

class StudentService extends BaseService {
  /**
   * @param {import("./student.repository").StudentRepository} repo
   */
  constructor(repo) {
    super(repo);
  }

  async create(dto) {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) throw AppError.conflict("Student with this email already exists");
    const student = await this.repo.create(dto);

    await cacheDelByPrefix("students:list:");

    const event = {
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      type: "student.created",
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
        age: student.age,
        createdAt: student.createdAt.toISOString(),
      },
    };
    await publishEvent("student.created", event, { messageId: event.eventId });

    return student;
  }

  buildWhere(filters) {
    const where = {};

    if (filters.email) where.email = filters.email;

    if (filters.name) {
      where.name = { contains: filters.name, mode: "insensitive" };
    }

    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: "insensitive" } },
        { email: { contains: filters.q, mode: "insensitive" } },
      ];
    }

    if (filters.minAge || filters.maxAge) {
      where.age = {};
      if (filters.minAge) where.age.gte = filters.minAge;
      if (filters.maxAge) where.age.lte = filters.maxAge;
    }

    return where;
  }

  async list(query) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = this.buildWhere(query);
    const [items, total] = await this.repo.list({ skip, take, where });
    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getById(id) {
    const student = await this.repo.findById(id);
    if (!student) throw AppError.notFound("Student not found");
    return student;
  }

  async update(id, dto) {
    await this.getById(id);
    const updated = await this.repo.updateById(id, dto);
    await cacheDel(`students:id:${id}`);
    await cacheDelByPrefix("students:list:");
    return updated;
  }

  async remove(id) {
    await this.getById(id);
    await this.repo.deleteById(id);
    await cacheDel(`students:id:${id}`);
    await cacheDelByPrefix("students:list:");
  }
}

module.exports = { StudentService };

