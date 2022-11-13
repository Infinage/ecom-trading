const express = require("express");

const {
    login, 
    register, 
    getUser
} = require("../controllers/user-controller");

const authMiddleware = require("../middlewares/auth-middleware");

const userRouter = express.Router();
userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.get("/:id", authMiddleware, getUser);

module.exports = userRouter;