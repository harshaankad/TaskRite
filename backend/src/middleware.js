"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.workerMiddleware = workerMiddleware;
var config_1 = require("./config");
var jsonwebtoken_1 = require("jsonwebtoken");
function authMiddleware(req, res, next) {
    var _a;
    var authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0 ? _a : "";
    try {
        var decoded = jsonwebtoken_1.default.verify(authHeader, config_1.JWT_SECRET);
        console.log(decoded);
        // @ts-ignore
        if (decoded.userId) {
            // @ts-ignore
            req.userId = decoded.userId;
            return next();
        }
        else {
            return res.status(403).json({
                message: "You are not logged in"
            });
        }
    }
    catch (e) {
        return res.status(403).json({
            message: "You are not logged in"
        });
    }
}
function workerMiddleware(req, res, next) {
    var _a;
    var authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0 ? _a : "";
    console.log(authHeader);
    try {
        var decoded = jsonwebtoken_1.default.verify(authHeader, config_1.WORKER_JWT_SECRET);
        // @ts-ignore
        if (decoded.userId) {
            // @ts-ignore
            req.userId = decoded.userId;
            return next();
        }
        else {
            return res.status(403).json({
                message: "You are not logged in"
            });
        }
    }
    catch (e) {
        return res.status(403).json({
            message: "You are not logged in"
        });
    }
}
