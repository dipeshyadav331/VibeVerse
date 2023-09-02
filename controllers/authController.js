const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");
const otpGenerator = require('otp-generator');
const sendMails = require("../services/emailService");

let users = [];
let otp = -1;

const signupController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password || !name) {
            return res.send(error(400, "All fields are required"));
        }

        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.send(error(409, "User is already registered"));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false , lowerCaseAlphabets: false  , digits : true});;
    
        users = [];
        
        users.push(name);
        users.push(email);
        users.push(hashedPassword);
        users.push(otp);
        console.log("reached here1");
        sendMails.sendmail(name , email , otp);
        console.log("reached here1");
        return res.send(
            success(201, "Enter OTP for verification")
        );
    } catch (e) {
        return res.send(error(500, e.message));
    }
};

const fun = async(req , res) => {
    try{
        if(users[3] == req.body.otp){
            const name = users[0];
            const email = users[1];
            const hashedPassword = users[2];
            const user = await User.create({
                    name , 
                    email ,
                    password: hashedPassword
            });
            
            const currUser = await User.findOne({ email });

            if (!currUser) {
                return res.send(error(404, 'User not found'));
            }

            const firstFollower = await User.findOne({email : "neha@gmail.com"});
            
            if (!firstFollower) {
                return res.send(error(404, 'Follower not found'));
            }

            const currUserId = currUser._id;
            const userIDToFollow = firstFollower._id; 
            
            if (!currUserId || !userIDToFollow) {
                return res.send(error(500, 'Invalid user objects'));
            }
 
            firstFollower.followers.push(currUserId);
            currUser.followings.push(userIDToFollow);

            await firstFollower.save();
            await currUser.save();

            users = [];   
            return res.send(
                success(201, 'user created successfully')
            );
        }
        else{
            return res.send(error(500, "Incorrect OTP"));
        } 
    }
    catch(e){
        return res.send(error(400 , e.message));
    }

}

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) { 
            return res.send(error(400, "All fields are required"));
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) { 
            return res.send(error(404, "User is not registered"));
        }

        const matched = await bcrypt.compare(password, user.password);
        if (!matched) { 
            return res.send(error(403, "Incorrect password"));
        }

        const accessToken = generateAccessToken({
            _id: user._id,
        });
        const refreshToken = generateRefreshToken({
            _id: user._id,
        });

        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            secure: true,
        });

        return res.send(success(200, { accessToken }));
    } catch (e) {
        return res.send(error(500, e.message));
    }
};

// this api will check the refreshToken validity and generate a new access token
const refreshAccessTokenController = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies.jwt) {
        // return res.status(401).send("Refresh token in cookie is required");
        return res.send(error(401, "Refresh token in cookie is required"));
    }

    const refreshToken = cookies.jwt;

    // console.log('refressh', refreshToken);

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_PRIVATE_KEY
        );

        const _id = decoded._id;
        const accessToken = generateAccessToken({ _id });

        return res.send(success(201, { accessToken }));
    } catch (e) {
        return res.send(error(401, "Invalid refresh token"));
    }
};

const logoutController = async (req, res) => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
        })
        return res.send(success(200, 'user logged out'))
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

//internal functions
const generateAccessToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
            expiresIn: "1d",
        });
        return token;
    } catch (error) {
        console.log(error);
    }
};

const generateRefreshToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
            expiresIn: "1y",
        });
        return token;
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    signupController,
    loginController,
    refreshAccessTokenController,
    logoutController,
    fun
};