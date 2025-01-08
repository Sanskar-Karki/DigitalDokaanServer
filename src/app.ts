import express from "express";
import "./database/connection";
import userRoute from "./routes/userRoute";
import categoryRoute from "./routes/categoryRoute";

const app = express();
app.use(express.json());
app.use("/api/auth", userRoute);
app.use("/api/category", categoryRoute);

export default app;
