// JWT signing / verification helpers and the auth cookie contract.
const jwt = require('jsonwebtoken');
const config = require('../env');

/**
 * Sign an access token. Payload should be minimal: { id, role }.
 */
const signToken = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

/**
 * Verify a token, returning its decoded payload. Throws on invalid/expired tokens.
 */
const verifyToken = (token) => jwt.verify(token, config.jwt.secret);

// Name of the httpOnly cookie that also carries the token (in addition to the JSON body).
const AUTH_COOKIE = 'vb_token';

const cookieOptions = () => ({
  httpOnly: true,
  secure: config.isProd,
  sameSite: config.isProd ? 'none' : 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});

module.exports = { signToken, verifyToken, AUTH_COOKIE, cookieOptions };
