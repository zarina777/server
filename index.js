require("dotenv").config(); // Load .env variables first
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

if (!DB_URL) {
  throw new Error("DB_URL is not defined in environment variables");
}

const usersRoute = require("./routes/users.router");
const productsRoute = require("./routes/products.router");
const categoriesRoute = require("./routes/categories.router");
const auth = require("./routes/auth.router");
const server = express();

server.use(express.json());
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

server.use(cors(corsOptions));

// Routes
server.use("/users", usersRoute);
server.use("/products", productsRoute);
server.use("/categories", categoriesRoute);
server.use("/auth", auth);

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("Successfully connected to DB");
    server.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err);
    process.exit(1); // Exit process on DB connection failure
  });
