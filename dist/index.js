"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./lib/rpc-client/client");
exports.RpcClient = client_1.RpcClient;
exports.createClient = client_1.create;
const server_1 = require("./lib/rpc-server/server");
exports.createServer = server_1.create;
const gateway_1 = require("./lib/rpc-server/gateway");
exports.Gateway = gateway_1.Gateway;
const utils_1 = require("./lib/util/utils");
exports.listEs6ClassMethods = utils_1.listEs6ClassMethods;
//# sourceMappingURL=index.js.map