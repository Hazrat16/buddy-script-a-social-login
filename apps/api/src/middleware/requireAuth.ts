import type { RequestHandler } from "express";
import { getSessionFromRequest } from "../lib/session";

export const requireAuth: RequestHandler = async (req, res, next) => {
  const session = await getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.auth = session;
  next();
};
