const bcrypt = require("bcrypt");
const { AppError } = require("../../errors/AppError");
const { AuthRepository } = require("./auth.repository");
const { sha256, signAccessToken, signRefreshToken, verifyRefreshToken } = require("./auth.tokens");
const { env } = require("../../config/env");
const { logger } = require("../../utils/logger");

class AuthService {
  /**
   * @param {AuthRepository} repo
   */
  constructor(repo = new AuthRepository()) {
    this.repo = repo;
    // Fire-and-forget; keeps startup simple in Docker.
    this.seedAdminIfConfigured().catch((e) => {
      logger.warn("Admin seed skipped/failed", { message: e?.message });
    });
  }

  async seedAdminIfConfigured() {
    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;

    const existing = await this.repo.findUserByEmail(env.ADMIN_EMAIL);
    if (existing) return;

    const password = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    await this.repo.createUser({ email: env.ADMIN_EMAIL, password, role: "ADMIN" });
    logger.info("Seeded default admin user", { email: env.ADMIN_EMAIL });
  }

  async register(dto) {
    const existing = await this.repo.findUserByEmail(dto.email);
    if (existing) throw AppError.conflict("Email already registered");

    const password = await bcrypt.hash(dto.password, 12);
    const role = dto.role ?? "STUDENT";

    const user = await this.repo.createUser({ email: dto.email, password, role });
    const tokens = await this.issueTokens(user);

    return { user: this.toUserDto(user), ...tokens };
  }

  async login(dto) {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) throw AppError.unauthorized("Invalid credentials");

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw AppError.unauthorized("Invalid credentials");

    const tokens = await this.issueTokens(user);
    return { user: this.toUserDto(user), ...tokens };
  }

  async refresh(dto) {
    let payload;
    try {
      payload = verifyRefreshToken(dto.refreshToken);
    } catch (e) {
      throw AppError.unauthorized("Invalid refresh token", { message: e.message });
    }

    const tokenHash = sha256(dto.refreshToken);
    const stored = await this.repo.findRefreshTokenByHash(tokenHash);
    if (!stored) throw AppError.unauthorized("Refresh token not recognized");
    if (stored.revokedAt) throw AppError.unauthorized("Refresh token revoked");
    if (stored.expiresAt.getTime() <= Date.now()) throw AppError.unauthorized("Refresh token expired");

    // Defense-in-depth: ensure the signed token belongs to the same user + token record.
    if (stored.id !== payload.jti) throw AppError.unauthorized("Refresh token mismatch");
    if (stored.userId !== payload.sub) throw AppError.unauthorized("Refresh token subject mismatch");

    // Rotate refresh token.
    await this.repo.revokeRefreshToken(stored.id);
    const tokens = await this.issueTokens(stored.user);

    return { user: this.toUserDto(stored.user), ...tokens };
  }

  async issueTokens(user) {
    // Create a refresh token DB row first (id used as JWT jti).
    const expiresAt = this.computeExpiresAtFromNow();
    const refreshRow = await this.repo.createRefreshToken({
      userId: user.id,
      tokenHash: `${user.id}:${Date.now()}:${Math.random()}`, // temporary unique value
      expiresAt,
    });

    const refreshToken = signRefreshToken({ userId: user.id, refreshTokenId: refreshRow.id });
    const tokenHash = sha256(refreshToken);

    await this.repo.updateRefreshTokenHash(refreshRow.id, tokenHash);

    const accessToken = signAccessToken(user);
    return { accessToken, refreshToken };
  }

  computeExpiresAtFromNow() {
    // We store refresh token expiry in DB for quick checks.
    // Parse only simple formats: Nd, Nh, Nm (e.g. 30d). Fallback: 30 days.
    const raw = require("../../config/env").env.JWT_REFRESH_EXPIRES_IN || "30d";
    const match = /^(\d+)([dhm])$/.exec(raw);
    if (!match) return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const n = Number(match[1]);
    const unit = match[2];
    const ms =
      unit === "d"
        ? n * 24 * 60 * 60 * 1000
        : unit === "h"
          ? n * 60 * 60 * 1000
          : n * 60 * 1000;
    return new Date(Date.now() + ms);
  }

  toUserDto(user) {
    return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
  }
}

module.exports = { AuthService };

