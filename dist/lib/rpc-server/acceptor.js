"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const acceptor = require("./acceptors/mqtt-acceptor");
// var acceptor from ('./acceptors/ws2-acceptor');
module.exports.create = function (opts, cb) {
    return acceptor.create(opts, cb);
};
//# sourceMappingURL=acceptor.js.map