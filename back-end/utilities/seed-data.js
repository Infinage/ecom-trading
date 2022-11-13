const data = require("../data/data.json");

const User = require("../data/User");
const Product = require("../data/Product");

const seedDB = async () => {

    let count = 0;

    for (let index in data.products){

        let product = new Product(data.products[index]);
        const validationResult = product.validateSync();

        if (!validationResult && await User.exists({_id: product.user})){
            
            product = await product.save();
            await User.findByIdAndUpdate(
                product.user, 
                { $push: {offerings: product} }, 
                {new: true}
            );

            count++;

        } else {
            console.log(`An error occured trying to add Product #${index}: ${validationResult.message}`)
        }

    }

    console.log(`${count} number of products have been added to the DB.`);
}

module.exports = seedDB;

