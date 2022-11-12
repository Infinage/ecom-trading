const {StatusCodes} = require("http-status-codes");

const data = require("../data/data.json");

const getAllProducts = async (req, res) => {
    res.status(StatusCodes.OK).json(data);
}

const getProductById = async (req, res) => {
    let {id} = req.params;
    if (!id.match(/^\d+$/)){
        res.status(StatusCodes.BAD_REQUEST).json({});
    } else {
        const result = data.at(id - 1);
        if (result){
            res.status(StatusCodes.OK).json(result);
        } else {
            res.status(StatusCodes.NOT_FOUND).json({});
        }
    }
}

const getProductsByCategory = async (req, res) => {
    const {category} = req.params;
    const result = data.filter(prod => prod.category === category);
    if (result.length > 0){
        res.status(StatusCodes.OK).json(result);
    } else {
        res.status(StatusCodes.NOT_FOUND).json({});
    }
}

module.exports = {getAllProducts, getProductById, getProductsByCategory}