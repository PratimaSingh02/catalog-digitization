const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");

const generateAccessToken = (user) => {
    return jwt.sign(
        { _id: user._id },
        process.env.JWT_ACCESS_SECRET_KEY,
        { expiresIn: "15m" }
    );
}

const generateRefreshToken = async (user) => {
    let refreshToken = jwt.sign(
        { _id: user?._id },
        process.env.JWT_REFRESH_SECRET_KEY,
        { expiresIn: "30m" }
    );
    //push this new RefreshToken to db
    const refreshTokenDocument = await RefreshToken({
        token: refreshToken
    });
    await refreshTokenDocument.save();
    return refreshToken;
}

const generateNewTokens = async (refreshToken, user) => {
    //delete old version of refreshToken for security
    await RefreshToken.findOneAndDelete({ token: refreshToken });
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);
    return { newAccessToken, newRefreshToken }
}

module.exports = { generateAccessToken, generateRefreshToken, generateNewTokens }