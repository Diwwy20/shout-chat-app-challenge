import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import config from "../config";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    console.error("Unexpected Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: config.nodeEnv === "development" ? err.stack : undefined,
  });
};
