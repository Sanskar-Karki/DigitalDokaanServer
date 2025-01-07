import { envConfig } from "./config/config";
import User from "./database/models/userModel";
import bcrypt from "bcrypt";
const adminSeeder = async () => {
  const [data] = await User.findAll({
    where: {
      email: envConfig.adminEmail,
    },
  });
  if (!data) {
    await User.create({
      username: envConfig.adminUsername,
      email: envConfig.adminEmail,
      password: bcrypt.hashSync(envConfig.adminPassword as string, 12),
      role: "admin",
    });
    console.log("Admin Seeded !!! ");
  } else {
    console.log("Admin already seeded !!!");
  }
};
export default adminSeeder;
