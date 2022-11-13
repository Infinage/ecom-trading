const {StatusCodes} = require("http-status-codes");
const {isValidObjectId} = require("mongoose");

const User = require("../data/User");

const register = async (req, res) => {

    let user = new User({...req.body});
    const validationResult = user.validateSync();

    if (!validationResult){
        const {name, email, password, address, phone} = req.body;
        user = await User.findOne({email});
        if (!user){ 
            user = await User.create({ name, email, password, address, phone });   
            const token = user.createJWT();
            res.status(StatusCodes.CREATED).json({user: {id: user._id}, token});
        } else { // If user already found, reject the register request
            res.status(StatusCodes.CONFLICT).json({message: "The Mail ID already exists. Please proceed to login."});
        }
    } else {
        res.status(StatusCodes.BAD_REQUEST).json({message: "User Schema validation has failed. " + validationResult.message});
    }
}

const login = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        res.status(StatusCodes.BAD_REQUEST).json({message: "Please enter user email and password to login."});
    } else {
        // PWD is hidden by default, so we specifically mention that we need it
        const user = await User.findOne({email}).select("+password");
        if (user && await user.comparePassword(password)){
            const token = user.createJWT();
            res.status(StatusCodes.OK).json({user: {id: user._id}, token});
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({message: "User ID or the Password entered is incorrect."});
        }
    }
}

const getUser = async (req, res) => {
    
    const {id} = req.params;

    // isValidObjectId is useful to test if the string passed is a valid objectID
    let user = isValidObjectId(id) ? await User.findById(id): null;

    if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({message: `User ID: ${id} doesn't exist.`});
    } else {

        // Mongoose docs don't allow deleting fields, so we convert it to JSON object first
        user = user.toJSON();

        // We remove certain personal fields if JWT doesn't belong to the user being fetched
        if (!req.user || req.user.userId != user._id){
            delete user['address']
            delete user['phone']
            delete user['endorsements']
            delete user['cart']
        }

        res.status(StatusCodes.OK).json(user);
    }
}

module.exports = {register, login, getUser};