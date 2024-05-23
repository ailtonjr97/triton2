const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticationMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization.replace('jwt=', '');
        if (token) {
            jwt.verify(token, process.env.JWTSECRET, (err) => {
                if (err) {
                    res.sendStatus(401);
                } else {
                    next();
                }
            });
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(401);
    }
}

function authenticationMiddlewareApi(req, res, next) {
    try {
        let token = req.headers.authorization.replace('jwt=', '');
        token = token.replace('Bearer ', '');
        if (token) {
            jwt.verify(token, process.env.JWTSECRET, (err) => {
                if (err) {
                    res.sendStatus(401);
                } else {
                    next();
                }
            });
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(401);
    }
}

module.exports = { authenticationMiddleware, authenticationMiddlewareApi };
