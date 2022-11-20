const {StatusCodes} = require("http-status-codes");
const { isValidObjectId } = require("mongoose");

const User = require("../data/User");
const Product = require("../data/Product");

const placeOrder = async (req, res) => {
    
    const {id: userId} = req.params;

    if (!req.user){
        res.status(StatusCodes.UNAUTHORIZED).json({message: "No credentials supplied."});
    } else if (userId != req.user.userId || !isValidObjectId(userId)){
        res.status(StatusCodes.FORBIDDEN).json({message: "User doesn't have sufficent access rights for this operation."});
    } else {
        /*
        Verify that each cart item is less than or equal to what is available.
        Remove these products from the user cart.
        return {order: [...], quantity: X, cost: Y}
        */
        const user = await User.findById(userId);
        const cart = user.cart;
        let totalQty = 0, totalCost = 0;

        // We save [_id, title, quantity, price]
        let result = [];

        // Send back _id, title, quantity, price

        for (let prodFromUserCart of cart){
            const prodId = prodFromUserCart.product
            let prodFromUserOffering = await Product.findById(prodId);
            if (!prodFromUserOffering){
                return res.status(StatusCodes.NOT_FOUND).json({message: `Product ID#: ${prodId} doesn't exist.`});
            } else if (prodFromUserCart.quantity > prodFromUserOffering.count){
                return res.status(StatusCodes.CONFLICT).json({
                    message: `Only ${prodFromUserOffering.count} item(s) is left in stock: ${prodId}`
                });
            } else {
                totalQty += prodFromUserCart.quantity;
                totalCost += prodFromUserOffering.price;
                result.push({_id: prodFromUserOffering._id, title: prodFromUserOffering.title, quantity: prodFromUserCart.quantity, price: prodFromUserOffering.price});
            }
        }

        // Remove all items from user cart
        user.cart = [];
        user.save();

        res.status(StatusCodes.OK).send({order: result, quantity: totalQty, cost: totalCost});
    }
}

module.exports = {placeOrder};