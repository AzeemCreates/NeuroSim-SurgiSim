const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN ?? "";
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID ?? "";
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE ?? "";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const missing = [
  !auth0Domain && "VITE_AUTH0_DOMAIN",
  !auth0ClientId && "VITE_AUTH0_CLIENT_ID",
  !auth0Audience && "VITE_AUTH0_AUDIENCE",
].filter(Boolean) as string[];

export const frontendEnv = {
  auth0Domain,
  auth0ClientId,
  auth0Audience,
  apiBaseUrl,
  isConfigured: missing.length === 0,
  missing,
};
