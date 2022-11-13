require("dotenv").config();
require("express-async-errors");

const cors = require("cors");
const express = require("express");

const productRouter = require("./routes/product-router");
const userRouter = require("./routes/user-router");
const connectDB = require("./data/connect");
const seedDB = require("./utilities/seed-data");

const app = express();

const port = process.env.PORT || 5000;

app.use([cors(), express.json()]);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/user", userRouter);

const start = async () => {
    try {
        
        connectDB(process.env.MONGO_URI);

        if (process.env.POPULATE_SEED_DATA == "true"){
            await seedDB();
        }

        app.listen(port, () => console.log(`Backend is up and listening on port#: ${port}`));

    } catch (err) {
        console.log("An unexpected error has occured: " + err);
    }
}

start();