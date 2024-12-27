import express from "express";
import cors from "cors";

import authRoute from "./routes/authRoutes.js";
import staticRoute from "./routes/staticRoutes.js";
import userRoute from "./routes/userRoutes.js";
import noteRoute from "./routes/noteRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api", staticRoute);
app.use("/api/notes", noteRoute);

export default app;
