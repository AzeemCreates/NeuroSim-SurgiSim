import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({ path: resolve(process.cwd(), "../.env") });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  auth0Audience: process.env.AUTH0_AUDIENCE ?? "",
  auth0IssuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL ?? "",
};

export function getMissingAuth0Env() {
  return [
    !env.auth0Audience && "AUTH0_AUDIENCE",
    !env.auth0IssuerBaseURL && "AUTH0_ISSUER_BASE_URL",
  ].filter(Boolean);
}
