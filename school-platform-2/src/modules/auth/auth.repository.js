const { prisma } = require("../../config/prisma");

class AuthRepository {
  findUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  createUser(data) {
    return prisma.user.create({ data });
  }

  createRefreshToken(data) {
    return prisma.refreshToken.create({ data });
  }

  updateRefreshTokenHash(id, tokenHash) {
    return prisma.refreshToken.update({ where: { id }, data: { tokenHash } });
  }

  findRefreshTokenByHash(tokenHash) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  revokeRefreshToken(id) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllRefreshTokensForUser(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

module.exports = { AuthRepository };

