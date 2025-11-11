const pool = require('../config/db');

const PasswordResetToken = {
  async invalidateTokensByEmail(email) {
    await pool.query(
      `UPDATE password_reset_token
       SET usado = 1
       WHERE email = ? AND usado = 0`,
      [email]
    );
  },

  async create(email, tokenHash, expiresAt) {
    const [result] = await pool.query(
      `INSERT INTO password_reset_token (email, tokenHash, expiracion, usado)
       VALUES (?, ?, ?, 0)`,
      [email, tokenHash, expiresAt]
    );
    return {
      idToken: result.insertId,
      email,
      tokenHash,
      expiracion: expiresAt,
      usado: 0,
    };
  },

  async findValidByEmailAndHash(email, tokenHash) {
    const [rows] = await pool.query(
      `SELECT *
       FROM password_reset_token
       WHERE email = ?
         AND tokenHash = ?
         AND usado = 0
         AND expiracion >= NOW()
       ORDER BY expiracion DESC
       LIMIT 1`,
      [email, tokenHash]
    );
    return rows[0];
  },

  async markAsUsed(idToken) {
    await pool.query(
      `UPDATE password_reset_token
       SET usado = 1, fechaUso = NOW()
       WHERE idToken = ?`,
      [idToken]
    );
  },
};

module.exports = PasswordResetToken;

