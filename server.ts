import adminSeeder from "./src/adminSeeder";
import app from "./src/app";
import { envConfig } from "./src/config/config";

function startServer() {
  const port = envConfig.port || 4000;
  adminSeeder();
  app.listen(port, () => {
    console.log(`Server has started at port ${port}`);
  });
}

startServer();
