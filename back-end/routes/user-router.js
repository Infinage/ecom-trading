const express = require("express");

const {
    login, 
    register, 
    getUser,
    pushCart,
    modifyCart
} = require("../controllers/user-controller");

const authMiddleware = require("../middlewares/auth-middleware");

const userRouter = express.Router();
userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.get("/:id", authMiddleware, getUser);
userRouter.patch("/modifyCart", authMiddleware, pushCart);
userRouter.patch("/modifyCart/:prodId", authMiddleware, modifyCart);

module.exports = userRouter;