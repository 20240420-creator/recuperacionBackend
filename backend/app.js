import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import usersRoutes from "./src/routes/users.js";
import registerUsersRoutes from "./src/routes/registerUsers.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/users", usersRoutes);
app.use("/api/registerUsers", registerUsersRoutes);





export default app;

