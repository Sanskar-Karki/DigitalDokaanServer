import { Sequelize } from "sequelize-typescript";
import { envConfig } from "../config/config";

const sequelize = new Sequelize(envConfig.connectionString as string);

try {
  sequelize
    .authenticate()
    .then(() => {
      console.log("Authenticaiton Verified , SupaBase Connection Successful");
    })
    .catch((error) => {
      console.log("Error ayo", error);
    });
} catch (error) {
  console.log(error);
}

export default sequelize;
