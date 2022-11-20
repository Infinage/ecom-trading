const express = require("express");
const { placeOrder } = require("../controllers/order-controller");
const authMiddleware = require("../middlewares/auth-middleware");

const orderRouter = express.Router();
orderRouter.post("/:id", authMiddleware, placeOrder);

module.exports = orderRouter;