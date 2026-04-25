import { auth } from "express-oauth2-jwt-bearer";
import { env, getMissingAuth0Env } from "../config/env.js";

const missingAuth0Env = getMissingAuth0Env();

export const requireAuth =
  missingAuth0Env.length === 0
    ? auth({
        audience: env.auth0Audience,
        issuerBaseURL: env.auth0IssuerBaseURL,
        tokenSigningAlg: "RS256",
      })
    : (_req, res) => {
        res.status(503).json({
          error: "Auth0 API verification is not configured.",
          missing: missingAuth0Env,
        });
      };

export function getUserClaims(req) {
  return req.auth?.payload ?? {};
}
