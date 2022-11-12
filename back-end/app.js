require("dotenv").config();
require("express-async-errors");

const cors = require("cors");
const express = require("express");

const productRouter = require("./routes/product-router");
const connectDB = require("./data/connect");

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use("/api/v1/products", productRouter);

const start = async () => {
    try {
        connectDB(process.env.MONGO_URI);
        app.listen(port, () => console.log(`Backend is up and listening on port#: ${port}`));
    } catch (err) {
        console.log("An unexpected error has occured: " + err);
    }
}

start();