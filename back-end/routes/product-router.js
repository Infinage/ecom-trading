const express = require("express");

const {
    getAllProducts, 
    addOffering, 
    getProductById, 
    updateOffering, 
    deleteOffering,
    getAllProductCategories,
    getProductsByCategory
} = require("../controllers/product-controller");

const authMiddleware = require("../middlewares/auth-middleware");

const productRouter = express.Router();

productRouter.route("/").get(getAllProducts).post(authMiddleware, addOffering);
productRouter.get("/category", getAllProductCategories);

productRouter.route("/:id").get(getProductById).patch(authMiddleware, updateOffering).delete(authMiddleware, deleteOffering);
productRouter.get("/category/:category", getProductsByCategory);

module.exports = productRouter;