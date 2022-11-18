const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const User = require("../data/User");

const authMiddleware = async (req, res, next) => {
    
    // check header for JWT
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        
        // Delete any user object that might have been passed and simply allow the request to pass through
        delete req.user;
        return next();
        
        // Alternatively we can deny access
        // res.status(StatusCodes.UNAUTHORIZED).json({message: "Authentication invalid"});
    }

    const token = authHeader.split(' ')[1]

    try {
        
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        
        // attach the user to the job routes
        req.user = { userId: payload.userId, name: payload.name };
        next()

    } catch (error) {
        res.status(StatusCodes.UNAUTHORIZED).json({message: "Authentication failed: " + error});
    }
}

module.exports = authMiddleware;
