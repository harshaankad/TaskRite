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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var tweetnacl_1 = require("tweetnacl");
var client_1 = require("@prisma/client");
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var middleware_1 = require("../middleware");
var config_1 = require("../config");
var db_1 = require("../db");
var types_1 = require("../types");
var web3_js_1 = require("@solana/web3.js");
var privateKey_1 = require("../privateKey");
var bs58_1 = require("bs58");
var connection = new web3_js_1.Connection((_a = process.env.RPC_URL) !== null && _a !== void 0 ? _a : "");
var TOTAL_SUBMISSIONS = 100;
var prismaClient = new client_1.PrismaClient();
prismaClient.$transaction(function (prisma) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/];
    });
}); }, {
    maxWait: 5000, // default: 2000
    timeout: 10000, // default: 5000
});
var router = (0, express_1.Router)();
router.post("/payout", middleware_1.workerMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, worker, transaction, keypair, signature, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.userId;
                return [4 /*yield*/, prismaClient.worker.findFirst({
                        where: { id: Number(userId) }
                    })];
            case 1:
                worker = _a.sent();
                if (!worker) {
                    return [2 /*return*/, res.status(403).json({
                            message: "User not found"
                        })];
                }
                transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
                    fromPubkey: new web3_js_1.PublicKey("8sjVZebKnWyek2yGWaGrUa5sDE1BfVh6i4QR7kMXTtuM"),
                    toPubkey: new web3_js_1.PublicKey(worker.address),
                    lamports: 1000000000 * worker.pending_amount / config_1.TOTAL_DECIMALS,
                }));
                console.log(worker.address);
                keypair = web3_js_1.Keypair.fromSecretKey((0, bs58_1.decode)(privateKey_1.privateKey));
                signature = "";
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [keypair])];
            case 3:
                signature = _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                return [2 /*return*/, res.json({
                        message: "Transaction failed"
                    })];
            case 5:
                console.log(signature);
                // We should add a lock here
                return [4 /*yield*/, prismaClient.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.worker.update({
                                        where: {
                                            id: Number(userId)
                                        },
                                        data: {
                                            pending_amount: {
                                                decrement: worker.pending_amount
                                            },
                                            locked_amount: {
                                                increment: worker.pending_amount
                                            }
                                        }
                                    })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, tx.payouts.create({
                                            data: {
                                                user_id: Number(userId),
                                                amount: worker.pending_amount,
                                                status: "Processing",
                                                signature: signature
                                            }
                                        })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 6:
                // We should add a lock here
                _a.sent();
                res.json({
                    message: "Processing payout",
                    amount: worker.pending_amount
                });
                return [2 /*return*/];
        }
    });
}); });
router.get("/balance", middleware_1.workerMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, worker;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.userId;
                return [4 /*yield*/, prismaClient.worker.findFirst({
                        where: {
                            id: Number(userId)
                        }
                    })];
            case 1:
                worker = _a.sent();
                res.json({
                    pendingAmount: worker === null || worker === void 0 ? void 0 : worker.pending_amount,
                    lockedAmount: worker === null || worker === void 0 ? void 0 : worker.pending_amount,
                });
                return [2 /*return*/];
        }
    });
}); });
router.post("/submission", middleware_1.workerMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, body, parsedBody, task, amount_1, submission, nextTask;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.userId;
                body = req.body;
                parsedBody = types_1.createSubmissionInput.safeParse(body);
                if (!parsedBody.success) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, db_1.getNextTask)(Number(userId))];
            case 1:
                task = _a.sent();
                if (!task || (task === null || task === void 0 ? void 0 : task.id) !== Number(parsedBody.data.taskId)) {
                    return [2 /*return*/, res.status(411).json({
                            message: "Incorrect task id"
                        })];
                }
                amount_1 = (Number(task.amount) / TOTAL_SUBMISSIONS).toString();
                return [4 /*yield*/, prismaClient.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var submission;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.submission.create({
                                        data: {
                                            option_id: Number(parsedBody.data.selection),
                                            worker_id: userId,
                                            task_id: Number(parsedBody.data.taskId),
                                            amount: Number(amount_1)
                                        }
                                    })];
                                case 1:
                                    submission = _a.sent();
                                    return [4 /*yield*/, tx.worker.update({
                                            where: {
                                                id: userId,
                                            },
                                            data: {
                                                pending_amount: {
                                                    increment: Number(amount_1)
                                                }
                                            }
                                        })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, submission];
                            }
                        });
                    }); })];
            case 2:
                submission = _a.sent();
                return [4 /*yield*/, (0, db_1.getNextTask)(Number(userId))];
            case 3:
                nextTask = _a.sent();
                res.json({
                    nextTask: nextTask,
                    amount: amount_1
                });
                return [3 /*break*/, 5];
            case 4:
                res.status(411).json({
                    message: "Incorrect inputs"
                });
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); });
router.get("/nextTask", middleware_1.workerMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, task;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.userId;
                return [4 /*yield*/, (0, db_1.getNextTask)(Number(userId))];
            case 1:
                task = _a.sent();
                if (!task) {
                    res.status(411).json({
                        message: "No more tasks left for you to review"
                    });
                }
                else {
                    res.json({
                        task: task
                    });
                }
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
                message = new TextEncoder().encode("Sign into mechanical turks as a worker");
                result = tweetnacl_1.default.sign.detached.verify(message, new Uint8Array(signature.data), new web3_js_1.PublicKey(publicKey).toBytes());
                if (!result) {
                    return [2 /*return*/, res.status(411).json({
                            message: "Incorrect signature"
                        })];
                }
                return [4 /*yield*/, prismaClient.worker.findFirst({
                        where: {
                            address: publicKey
                        }
                    })];
            case 1:
                existingUser = _b.sent();
                if (!existingUser) return [3 /*break*/, 2];
                token = jsonwebtoken_1.default.sign({
                    userId: existingUser.id
                }, config_1.WORKER_JWT_SECRET);
                res.json({
                    token: token,
                    amount: existingUser.pending_amount / config_1.TOTAL_DECIMALS
                });
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, prismaClient.worker.create({
                    data: {
                        address: publicKey,
                        pending_amount: 0,
                        locked_amount: 0
                    }
                })];
            case 3:
                user = _b.sent();
                token = jsonwebtoken_1.default.sign({
                    userId: user.id
                }, config_1.WORKER_JWT_SECRET);
                res.json({
                    token: token,
                    amount: 0
                });
                _b.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
