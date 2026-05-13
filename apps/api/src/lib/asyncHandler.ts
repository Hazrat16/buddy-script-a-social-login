import type { RequestHandler } from "express";

/** Express 4 does not forward rejected promises from async handlers; this passes them to `next`. */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
}
