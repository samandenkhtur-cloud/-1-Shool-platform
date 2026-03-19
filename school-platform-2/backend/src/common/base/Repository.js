class BaseRepository {
  /**
   * @param {import("@prisma/client").PrismaClient} prisma
   * @param {keyof import("@prisma/client").PrismaClient} modelName
   */
  constructor(prisma, modelName) {
    this.prisma = prisma;
    this.model = prisma[modelName];
    if (!this.model) {
      throw new Error(`Prisma model not found: ${String(modelName)}`);
    }
  }

  create(data) {
    return this.model.create({ data });
  }

  findById(id) {
    return this.model.findUnique({ where: { id } });
  }

  findMany(args = {}) {
    return this.model.findMany(args);
  }

  updateById(id, data) {
    return this.model.update({ where: { id }, data });
  }

  deleteById(id) {
    return this.model.delete({ where: { id } });
  }
}

module.exports = { BaseRepository };

