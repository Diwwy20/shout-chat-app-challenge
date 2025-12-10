import app from "./app";
import connectDB from "./config/database";
import config from "./config";

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });
};

startServer();
