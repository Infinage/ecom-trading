const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Name must be provided"],
    },

    email: {
        type: String, 
        validate: {
            validator: ele => ele.match(/\S+@\S+\.\S+/),
            message: "Email must be in proper format"
        },
        unique: [true, "Email ID already exists: {VALUE}"]
    },

    password: {
        type: String,
        required: true,
        
        // Don't show this field unless specified manually
        // .select("+password")
        select: false 
    },

    address: String,
    
    phone: {
        type: String,
        match: /\d{9}/
    },
    
    rating: {
        rate: Number,
        count: Number
    },

    endorsements: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        rate: Number,
        default: []
    }], 

    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        quantity: {
            type: Number,
            validate: ele => ele > 0,
        },
        _id: false,
    }], 

    offerings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: []
    }]
});

// Before saving the password to DB, hash it
UserSchema.pre("save", async function () {
    
    // We hash password only when manually provided. By default passwords are not returned 
    // by the backend unless explictly requested. So whenever there is a password field
    // the user deliberately wants to reset his password and so we hash it
    if (this.password){ 
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
    }

});

// Create a JWT token - We have the ID, name & Cart details in JWT
UserSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this._id, name: this.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME }
      );
}

// Utility function to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}

module.exports = mongoose.model("User", UserSchema);