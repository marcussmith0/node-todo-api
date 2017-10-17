const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const _ = require("lodash");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 1,
        validate: {
            validator: validator.isEmail,
            message: "{Value} is not an email."
        }
    },
    password: {
        type: String,
        minlength: 6,
        required: true
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

userSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ["_id", "email"]);
}

userSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth'
    var token = jwt.sign({_id: user._id.toHexString(), access}, "abc123").toString();

    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
}

userSchema.pre("save", function(next) {
    var user = this;

    if(user.isModified("password")) {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return err;

                user.password = hash;
                next();
            });
        });
    } else next();  
});

userSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, "abc123");
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
            "_id": decoded._id,
            "tokens.token": token,
            "tokens.access": 'auth'
        });
}

userSchema.methods.removeToken = function(token) {
    var user = this;

    return user.update({$pull: {
        tokens: { token }
    }});
}

userSchema.statics.findByCredentials = function(email, password) {
    var User = this;

    return User.findOne({email}).then((user) => {
        if(!user) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, result) => {
                if(!result) return reject();

                return resolve(user);
            });
        });
    });
}

module.exports = mongoose.model("User", userSchema);