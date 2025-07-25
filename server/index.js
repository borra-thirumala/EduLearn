import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";

console.log("app.js: Starting server configuration...");

dotenv.config({});
console.log("app.js: Dotenv configuration loaded.");

console.log("app.js: Attempting to connect to database...");
//call database connection here
connectDB();
const app = express();

const PORT = process.env.PORT || 3000;
console.log(`app.js: Server will attempt to listen on port ${PORT}`);

//default middleware
console.log("app.js: Applying express.json() middleware.");
app.use(express.json());
console.log("app.js: Applying cookie-parser() middleware.");
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//api's
console.log("app.js: Registering user routes under /api/v1/user.");

app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase",purchaseRoute);
app.use("/api/v1/progress",courseProgressRoute);

app.listen(PORT, () => {
  console.log(`app.js: Server successfully listening at port ${PORT}`);
  console.log(`Server listen at port ${PORT}`);
});
console.log(
  "app.js: Synchronous server setup complete. Waiting for server to listen..."
);
