import { Router } from "express";
import { getUserClaims, requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/protected/session", requireAuth, (req, res) => {
  const claims = getUserClaims(req);

  res.json({
    sub: claims.sub,
    scope: claims.scope,
    audience: claims.aud,
    message:
      "Auth0 token verified. Protected AI mentor routes are locked behind this boundary.",
    routes: ["/api/mentor", "/api/neuro-data", "/api/audio-guide"],
  });
});

function phaseTwoPlaceholder(route) {
  return (req, res) => {
    const claims = getUserClaims(req);

    res.status(501).json({
      route,
      message:
        "Phase 2 integration is not implemented yet. Auth0 protection is active.",
      sub: claims.sub,
    });
  };
}

router.post("/mentor", requireAuth, phaseTwoPlaceholder("/api/mentor"));
router.post("/neuro-data", requireAuth, phaseTwoPlaceholder("/api/neuro-data"));
router.post("/audio-guide", requireAuth, phaseTwoPlaceholder("/api/audio-guide"));

export default router;
