const {StatusCodes} = require("http-status-codes");
const {isValidObjectId} = require("mongoose");

// Import Mongoose Models
const Product = require("../data/Product");
const User = require("../data/User");

// Add a new product assuming request already exists
const addOffering = async (req, res) => {
    if (!req.user){
        res.status(StatusCodes.UNAUTHORIZED).json({message: "No credentials supplied."});
    } else if (req.user && req.user.userId !== req.body.user){
        res.status(StatusCodes.FORBIDDEN).json({message: "User doesn't have sufficent access rights for this operation."});
    } else {
        let product = new Product({...req.body})
        const validationResult = product.validateSync();

        if (!validationResult){

            product = await product.save();

            const user = await User.findByIdAndUpdate(
                req.user.userId, 
                { $push: {offerings: product} },
                {new: true}
            );

            res.status(StatusCodes.CREATED).json(product);
            
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({message: "Product Schema validation has failed. " + validationResult.message});
        }
    }
}

const getAllProducts = async (req, res) => {
    const products = await Product.find({});
    res.status(StatusCodes.OK).json({data: products, count: products.length});
}

// Populate the result with seller name & rating
const getProductById = async (req, res) => {
    let {id} = req.params;
    if (!isValidObjectId(id)){
        res.status(StatusCodes.BAD_REQUEST).json({message: `Product ID: ${id} doesn't exist.`});
    } else {
        const result = await Product.findById(id);
        if (result){
            res.status(StatusCodes.OK).json(result);
        } else {
            res.status(StatusCodes.NOT_FOUND).json({message: `Product ID: ${id} doesn't exist.`});
        }
    }
}

const updateOffering = async (req, res) => {
    const {id} = req.params;
    let product = isValidObjectId(id) ? await Product.findById(id): null;

    if (!product) {
        res.status(StatusCodes.NOT_FOUND).json({message: `Product ID: ${id} doesn't exist.`});
    } else if (req.user && req.user.userId === product.user.toString()){
        if (!req.body.user || req.body.user === product.user.toString()){
            product = await Product.findByIdAndUpdate(id, {...req.body}, {new: true});
            res.status(StatusCodes.OK).json(product);
        } else {
            res.status(StatusCodes.FORBIDDEN).json({message: "Cannot update the user ID"});
        }
    } else {
        res.status(StatusCodes.FORBIDDEN).json({message: "User doesn't have sufficent access rights for this operation."});
    }
}

const deleteOffering = async (req, res) => {
    const {id} = req.params;
    let product = isValidObjectId(id) ? await Product.findById(id): null;

    if (!product) {
        res.status(StatusCodes.NOT_FOUND).json({message: `Product ID: ${id} doesn't exist.`});
    } else if (req.user && req.user.userId === product.user.toString()){
        if (!req.body.user || req.body.user === product.user.toString()){
            
            // Remove that product listing
            product = await Product.findByIdAndDelete(id);

            // Remove user association to that product 
            const user = await User.findByIdAndUpdate(
                req.user.userId, 
                { $pull: {offerings: product._id} },
                {new: true}
            );
            
            // Converting to JSON for editing fields, we set the count as 0 after delisting
            product = product.toJSON();
            product.count = 0;
            res.status(StatusCodes.OK).json(product);

        } else {
            res.status(StatusCodes.FORBIDDEN).json({message: "Cannot update the user ID"});
        }
    } else {
        res.status(StatusCodes.FORBIDDEN).json({message: "User doesn't have sufficent access rights for this operation."});
    }

}

const getAllProductCategories = async (req, res) => {
    const result = await Product.distinct("category");
    res.status(StatusCodes.OK).json({data: result, count: result.length});
}

const getProductsByCategory = async (req, res) => {
    const {category} = req.params;
    const result = await Product.find({category});
    if (result.length > 0){
        res.status(StatusCodes.OK).json({data: result, count: result.length});
    } else {
        res.status(StatusCodes.NOT_FOUND).json({message: `Category: ${category} not found in the Database.`});
    }
}

module.exports = {getAllProducts, addOffering, getProductById, updateOffering, deleteOffering, getAllProductCategories, getProductsByCategory}