const express = require("express");

const {getAllProducts, getProductById, getProductsByCategory} = require("../controllers/product-controller");

const productRouter = express.Router();

productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.get("/category/:category", getProductsByCategory);

module.exports = productRouter;