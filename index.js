const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const loggerMiddleware = require("./middleware/loginMiddleware");
const errorHandler = require("./middleware/errorMiddleware");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const corsOption = {
  origin: true,
  credential: true,
  methods: "*",
};

connectDB();
app.use(express.json());
app.use(cors(corsOption));
app.use(cookieParser());

app.use(loggerMiddleware);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api", userRoutes);

app.use(errorHandler);

app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
