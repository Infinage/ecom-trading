const { isValidObjectId } = require("mongoose");

const data = require("../data/data.json");
const User = require("../data/User");
const Product = require("../data/Product");

const insertUsers = async () => {

    let count = 0;
    for (let index in data.users){
        
        let user = data.users[index];
        let newUser = new User(user);
        let validationResult;

        console.log(`Trying to insert user: ${JSON.stringify(user)}`);

        // If 'id' is provided, use that as '_id' for DB insertion
        if (user.id) {
            if (isValidObjectId(user.id)) 
                newUser._id = user.id;
            else
                validationResult = {"message": `User ID# ${user.id} is invalid.`}
        }

        // Ensure that the user doesn't already exist
        if (!validationResult && (await User.findOne({ $or: [{ "email": user.email }, { "_id": user._id }] })))
            validationResult = {"message": `User Email or ID already exists.`}

        // If no errors so far, perform a sanity check
        if (!validationResult)
            validationResult = newUser.validateSync();

        if (!validationResult){
            newUser = await newUser.save();
            console.log(`User ID: ${newUser._id} inserted successfully.`);
            count++;
        } else {
            console.log(`An error occured trying to add User# ${index}: ${validationResult.message}`)
        }
    }

    return count;
}

const insertProducts = async () => {

    let count = 0;
    for (let index in data.products){
        
        let product = data.products[index];
        let newProduct = new Product(product);
        let validationResult;

        console.log(`Trying to insert product: ${JSON.stringify(product)}`);

        // If 'id' is provided, use that as '_id' for DB insertion
        if (product.id) {
            // Ensure that 'id' is a proper mongo db ObjectID and that a product doesn't already exist.
            if (isValidObjectId(product.id) && !(await Product.exists({"_id": product.id}))) 
                newProduct._id = product.id;
            else
                validationResult = {"message": `Product ID: ${product.id} already exists or is invalid.`}
        }

        // Ensure that 'user' is valid and that it exists. We would attach every product with a user
        if (!validationResult && (!isValidObjectId(product.user) || !(await User.exists({"_id": product.user}))))
            validationResult = {"message": `User# ${product.user} doesn't exist or is invalid.`}

        // If no errors so far, do a quick sanity test
        if (!validationResult)
            validationResult = newProduct.validateSync();
        
        // validationResult is null if every thing looks good
        if (!validationResult){
            newProduct = await newProduct.save();
            await User.findByIdAndUpdate(
                newProduct.user, 
                { $push: {offerings: newProduct} }, 
                {new: true}
            );
            console.log(`Product ID: ${newProduct._id} inserted successfully.`);
            count++;
        } else {
            console.log(`An error occured trying to add Product# ${index}: ${validationResult.message}`)
        }
    }

    return count;
}

const seedDB = async () => {
    try {
        console.log(`${await insertUsers()} number of users have been added to the DB.`);
        console.log(`${await insertProducts()} number of products have been added to the DB.`);
    } catch (err) {
        console.error(`An error occurred during seeding: ${err.message}`);
    }
}

module.exports = seedDB;

