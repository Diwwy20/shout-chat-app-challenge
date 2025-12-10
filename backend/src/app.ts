import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import config from "./config";
import chatRoutes from "./routes/chatRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { AppError } from "./utils/AppError";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl }));
app.use(express.json());
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Shout Chat API is running...",
  });
});

app.use("/api/chat", chatRoutes);

app.use((req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
