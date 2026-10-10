import winston from "winston";
import { config } from "../config/config.js";

const baseLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (config.mode === "development") {
  baseLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

const normalizeLogArgs = (firstArg, secondArg) => {
  if (typeof firstArg === "string") {
    const meta =
      secondArg && typeof secondArg === "object" && !Array.isArray(secondArg)
        ? secondArg
        : {};

    return {
      message: firstArg,
      ...meta,
    };
  }

  if (firstArg && typeof firstArg === "object") {
    const meta = { ...firstArg };
    const message =
      meta.message || meta.error || meta.msg || secondArg || "Structured log";
    delete meta.message;
    return {
      message,
      ...meta,
    };
  }

  return {
    message: secondArg || "Structured log",
  };
};

const logWithLevel = (level, firstArg, secondArg) => {
  baseLogger.log({
    level,
    ...normalizeLogArgs(firstArg, secondArg),
  });
};

const logger = {
  error: (firstArg, secondArg) => logWithLevel("error", firstArg, secondArg),
  warn: (firstArg, secondArg) => logWithLevel("warn", firstArg, secondArg),
  info: (firstArg, secondArg) => logWithLevel("info", firstArg, secondArg),
  debug: (firstArg, secondArg) => logWithLevel("debug", firstArg, secondArg),
  log: (level, firstArg, secondArg) => logWithLevel(level, firstArg, secondArg),
  child: (...args) => baseLogger.child(...args),
};

export default logger;
