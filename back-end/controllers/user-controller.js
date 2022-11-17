const {StatusCodes} = require("http-status-codes");
const {isValidObjectId} = require("mongoose");

const Product = require("../data/Product");
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
            res.status(StatusCodes.CREATED).json({user: {id: user._id, name: user.name}, token});
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
            res.status(StatusCodes.OK).json({user: {id: user._id, name: user.name}, token});
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

const modifyCart = async (req, res) => {
    
    /* 
    Modify cart items: 
    1. Add one instance of item
    2. Add multiple instances of same item
    3. Subtract one instance of an item
    4. Remove an item from cart, regardless of the count
    */

    const {prodId: id} = req.params;
    let {op, qty} = req.query;

    if (!op) op = "ADD";
    if (!qty || qty <= 0) qty = 1;

    let product = isValidObjectId(id) ? await Product.findById(id): null;

    if (!product) { // Check if the product exists
        res.status(StatusCodes.NOT_FOUND).json({message: `Product ID: ${id} doesn't exist.`});
    } else if (req.user){ // Check if there is an user logged in 
        if (req.user.userId === product.user.toString()){
            res.status(StatusCodes.BAD_REQUEST).json({message: `A Seller cannot transact with his own items.`});
        } else { // Actual cart modification logic beings

            const user = await User.findById(req.user.userId);
            let found = false, toRemove;

            for (let index in user.cart){
                let prod = user.cart[index];
                if (prod.product.toString() === product._id.toString()){
                    prod.quantity += op === "ADD" ? qty: -qty;
                    if (prod.quantity <= 0) toRemove = index;
                    found = true;
                    break;
                }
            }

            if (!found) { 
                if (op === "ADD")
                    user.cart.push({product: product._id, quantity: qty}); 
                else 
                    return res.status(StatusCodes.NOT_FOUND).json({message: `Product ID: ${id} doesn't exist in the user's Cart.`})
            }

            if (toRemove)
                user.cart = [...user.cart.slice(0, toRemove), ...user.cart.slice(toRemove + 1)];

            user.save(); // Save the changes to user to the DB
            res.status(StatusCodes.OK).json({data: user.cart});

        }
    } else { // If no user is logged in, simply return an empty list
        res.status(StatusCodes.UNAUTHORIZED).json({message: "There is no user currently signed in."});
    }
}

module.exports = {register, login, getUser, modifyCart};