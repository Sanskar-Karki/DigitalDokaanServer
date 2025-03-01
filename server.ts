import adminSeeder from "./src/adminSeeder";
import app from "./src/app";
import { envConfig } from "./src/config/config";
import categoryController from "./src/controllers/categoryController";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./src/database/models/userModel";

function startServer() {
  const port = envConfig.port || 4000;
  adminSeeder();
  const server = app.listen(port, () => {
    categoryController.seedCategory();
    console.log(`Server has started at port ${port}`);
  });
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });
  
  let onlineUsers: { socketId: string; userId: string; role: string }[] = [];
  let addToOnlineUsers = (socketId: string, userId: string, role: string) => {
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    onlineUsers.push({ socketId, userId, role });
  };

  io.on("connection", (socket) => {
    const { token } = socket.handshake.auth; //jwt token
    if (token) {
      jwt.verify(
        token,
        envConfig.jwtSecretKey as string,
        async (err: any, result: any) => {
          if (err) {
            socket.emit("error", err);
          } else {
            const userData = await User.findByPk(result.userId); //{email:"",pass:"",role:""}
            if (!userData) {
              socket.emit("error", "No user found with that token!!!");
              return;
            }

            // user vetyo vane userId grab garne user
            addToOnlineUsers(socket.id, result.userId, userData.role);
          }
        }
      );
    }
  });
}

startServer();
