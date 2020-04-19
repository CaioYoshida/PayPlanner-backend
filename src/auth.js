const jwt = require('jsonwebtoken');
const { secret } = require('./config/authConfig');

const autheticate = async (resolve, root, args, context, info) => {
    let token;
    try {
        token = await jwt.verify(context.request.get("Authorization"), secret);
    } catch (e) {
        return new Error("Not authorized");
    }
    context.claims = token.claims;
    const result = await resolve(root, args, context, info);
    return result;
};

module.exports = autheticate;
