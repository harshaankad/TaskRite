"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
var tweetnacl_1 = require("tweetnacl");
var client_1 = require("@prisma/client");
var express_1 = require("express");
var client_s3_1 = require("@aws-sdk/client-s3");
var jsonwebtoken_1 = require("jsonwebtoken");
var config_1 = require("../config");
var middleware_1 = require("../middleware");
var s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
var types_1 = require("../types");
var web3_js_1 = require("@solana/web3.js");
var connection = new web3_js_1.Connection((_a = process.env.RPC_URL) !== null && _a !== void 0 ? _a : "");
var PARENT_WALLET_ADDRESS = "8sjVZebKnWyek2yGWaGrUa5sDE1BfVh6i4QR7kMXTtuM";
var DEFAULT_TITLE = "Select the most clickable thumbnail";
var s3Client = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: (_b = process.env.ACCESS_KEY_ID) !== null && _b !== void 0 ? _b : "",
        secretAccessKey: (_c = process.env.ACCESS_SECRET) !== null && _c !== void 0 ? _c : "",
    },
    region: "eu-north-1"
});
var router = (0, express_1.Router)();
var prismaClient = new client_1.PrismaClient();
prismaClient.$transaction(function (prisma) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/];
    });
}); }, {
    maxWait: 5000, // default: 2000
    timeout: 10000, // default: 5000
});
router.get("/task", middleware_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var taskId, userId, taskDetails, responses, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                taskId = req.query.taskId;
                userId = req.userId;
                return [4 /*yield*/, prismaClient.task.findFirst({
                        where: {
                            user_id: Number(userId),
                            id: Number(taskId)
                        },
                        include: {
                            options: true
                        }
                    })];
            case 1:
                taskDetails = _a.sent();
                if (!taskDetails) {
                    return [2 /*return*/, res.status(411).json({
                            message: "You dont have access to this task"
                        })];
                }
                return [4 /*yield*/, prismaClient.submission.findMany({
                        where: {
                            task_id: Number(taskId)
                        },
                        include: {
                            option: true
                        }
                    })];
            case 2:
                responses = _a.sent();
                result = {};
                taskDetails.options.forEach(function (option) {
                    result[option.id] = {
                        count: 0,
                        option: {
                            imageUrl: option.image_url
                        }
                    };
                });
                responses.forEach(function (r) {
                    result[r.option_id].count++;
                });
                res.json({
                    result: result,
                    taskDetails: taskDetails
                });
                return [2 /*return*/];
        }
    });
}); });
router.post("/task", middleware_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, body, parseData, user, transaction, response;
    var _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                userId = req.userId;
                body = req.body;
                parseData = types_1.createTaskInput.safeParse(body);
                return [4 /*yield*/, prismaClient.user.findFirst({
                        where: {
                            id: userId
                        }
                    })];
            case 1:
                user = _g.sent();
                if (!parseData.success) {
                    return [2 /*return*/, res.status(411).json({
                            message: "You've sent the wrong inputs"
                        })];
                }
                return [4 /*yield*/, connection.getTransaction(parseData.data.signature, {
                        maxSupportedTransactionVersion: 1
                    })];
            case 2:
                transaction = _g.sent();
                console.log(transaction);
                if (((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.meta) === null || _a === void 0 ? void 0 : _a.postBalances[1]) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.meta) === null || _c === void 0 ? void 0 : _c.preBalances[1]) !== null && _d !== void 0 ? _d : 0) !== 100000000) {
                    return [2 /*return*/, res.status(411).json({
                            message: "Transaction signature/amount incorrect"
                        })];
                }
                if (((_e = transaction === null || transaction === void 0 ? void 0 : transaction.transaction.message.getAccountKeys().get(1)) === null || _e === void 0 ? void 0 : _e.toString()) !== PARENT_WALLET_ADDRESS) {
                    return [2 /*return*/, res.status(411).json({
                            message: "Transaction sent to wrong address"
                        })];
                }
                if (((_f = transaction === null || transaction === void 0 ? void 0 : transaction.transaction.message.getAccountKeys().get(0)) === null || _f === void 0 ? void 0 : _f.toString()) !== (user === null || user === void 0 ? void 0 : user.address)) {
                    return [2 /*return*/, res.status(411).json({
                            message: "Transaction sent to wrong address"
                        })];
                }
                return [4 /*yield*/, prismaClient.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var response;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, tx.task.create({
                                        data: {
                                            title: (_a = parseData.data.title) !== null && _a !== void 0 ? _a : DEFAULT_TITLE,
                                            amount: 0.1 * config_1.TOTAL_DECIMALS,
                                            //TODO: Signature should be unique in the table else people can reuse a signature
                                            signature: parseData.data.signature,
                                            user_id: userId
                                        }
                                    })];
                                case 1:
                                    response = _b.sent();
                                    return [4 /*yield*/, tx.option.createMany({
                                            data: parseData.data.options.map(function (x) { return ({
                                                image_url: x.imageUrl,
                                                task_id: response.id
                                            }); })
                                        })];
                                case 2:
                                    _b.sent();
                                    return [2 /*return*/, response];
                            }
                        });
                    }); })];
            case 3:
                response = _g.sent();
                res.json({
                    id: response.id
                });
                return [2 /*return*/];
        }
    });
}); });
router.get("/presignedUrl", middleware_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, url, fields;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = req.userId;
                return [4 /*yield*/, (0, s3_presigned_post_1.createPresignedPost)(s3Client, {
                        Bucket: 'hkirat-cms',
                        Key: "fiver/".concat(userId, "/").concat(Math.random(), "/image.jpg"),
                        Conditions: [
                            ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
                        ],
                        Expires: 3600
                    })];
            case 1:
                _a = _b.sent(), url = _a.url, fields = _a.fields;
                res.json({
                    preSignedUrl: url,
                    fields: fields
                });
                return [2 /*return*/];
        }
    });
}); });
router.post("/signin", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, publicKey, signature, message, result, existingUser, token, user, token;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, publicKey = _a.publicKey, signature = _a.signature;
                message = new TextEncoder().encode("Sign into mechanical turks");
                result = tweetnacl_1.default.sign.detached.verify(message, new Uint8Array(signature.data), new web3_js_1.PublicKey(publicKey).toBytes());
                if (!result) {
                    return [2 /*return*/, res.status(411).json({
                            message: "Incorrect signature"
                        })];
                }
                return [4 /*yield*/, prismaClient.user.findFirst({
                        where: {
                            address: publicKey
                        }
                    })];
            case 1:
                existingUser = _b.sent();
                if (!existingUser) return [3 /*break*/, 2];
                token = jsonwebtoken_1.default.sign({
                    userId: existingUser.id
                }, config_1.JWT_SECRET);
                res.json({
                    token: token
                });
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, prismaClient.user.create({
                    data: {
                        address: publicKey,
                    }
                })];
            case 3:
                user = _b.sent();
                token = jsonwebtoken_1.default.sign({
                    userId: user.id
                }, config_1.JWT_SECRET);
                res.json({
                    token: token
                });
                _b.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
