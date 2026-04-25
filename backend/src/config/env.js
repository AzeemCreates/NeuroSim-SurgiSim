import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({ path: resolve(process.cwd(), "../.env") });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  
  // Phase 1: Auth0
  auth0Audience: process.env.AUTH0_AUDIENCE ?? "",
  auth0IssuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL ?? "",
  
  // Phase 2: AI, Database, and Sponsors
  mongoURI: process.env.MONGODB_URI ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY ?? "",
  snowflakeAccount: process.env.SNOWFLAKE_ACCOUNT ?? "",
  snowflakeUser: process.env.SNOWFLAKE_USER ?? "",
  snowflakePassword: process.env.SNOWFLAKE_PASSWORD ?? "",
};

export function getMissingAuth0Env() {
  return [
    !env.auth0Audience && "AUTH0_AUDIENCE",
    !env.auth0IssuerBaseURL && "AUTH0_ISSUER_BASE_URL",
  ].filter(Boolean);
}

export function getMissingPhase2Env() {
  return [
    !env.mongoURI && "MONGODB_URI",
    !env.geminiApiKey && "GEMINI_API_KEY",
    !env.elevenLabsApiKey && "ELEVENLABS_API_KEY",
    (!env.snowflakeAccount || !env.snowflakeUser || !env.snowflakePassword) && "SNOWFLAKE_CREDENTIALS"
  ].filter(Boolean);
}
