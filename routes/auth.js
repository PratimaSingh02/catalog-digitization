const router = require("express").Router();
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    generateAccessToken,
    generateRefreshToken,
    generateNewTokens
} = require("../utils/token");
const { verify } = require("../middlewares/auth");

//register
router.post("/register", async (req, res) => {
    try {
        const userData = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const newUser = new User({//create document
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
        })
        const user = await newUser.save();//save document
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

//login
router.post("/login", async (req, res) => {
    try {
        const userData = req.body;
        const user = await User.findOne({ username: userData.username });
        if (!user)
            return res.status(400).json("Wrong credentials!");
        const validate = await bcrypt.compare(userData.password, user.password);
        if (!validate)
            return res.status(400).json("Wrong credentials!");
        const accessToken = generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);
        res.status(200).json({
            user,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})

//refresh token
router.post("/refresh", async (req, res) => {
    //take the refresh token from user
    const refreshToken = req.body.token;

    //for security purpose, we will store only active refresh tokens in db
    //so that hacker can't use previous refresh token to gain new tokens
    //to update access tokens we use refresh token

    //send error if there is no token or token is invalid
    if (!refreshToken)
        return res.status(401).json("You are not authenticated");
    let oldRefreshToken = await RefreshToken.findOne({ token: refreshToken });

    if (!oldRefreshToken)
        return res.status(401).json("Refresh token is not valid");
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY,
        async (error, user) => {
            if (error)
                return res.status(401).json("Refresh token is not valid");

            const { newAccessToken, newRefreshToken } = await generateNewTokens(refreshToken, user);
            res.status(200).json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        }
    );
})

router.post("/logout", verify, async (req, res) => {
    const refreshToken = req.body.token;
    try {
        //delete refreshToken for security
        await RefreshToken.findOneAndDelete({ token: refreshToken });
        res.status(200).json("Logged out successfully!");
        //accessToken will still be valid after logOut tillits expiry time
        //but hacker can't use the refresh token to gain new accessToken as refreshToken is deleted
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;