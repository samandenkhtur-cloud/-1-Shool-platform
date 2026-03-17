const { BaseRepository } = require("../../common/base/Repository");
const { prisma } = require("../../config/prisma");

class StudentRepository extends BaseRepository {
  constructor() {
    super(prisma, "student");
  }

  findByEmail(email) {
    return this.model.findUnique({ where: { email } });
  }

  list({ skip, take, where }) {
    return prisma.$transaction([
      this.model.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.model.count({ where }),
    ]);
  }
}

module.exports = { StudentRepository };

