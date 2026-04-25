import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "neurosim-web3-api",
    phase: 1,
  });
});

export default router;
