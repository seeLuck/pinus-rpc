"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default mailbox factory
 */
const Mailbox = require("./mailboxes/mqtt-mailbox");
// var Ws2Mailbox from ('./mailboxes/ws2-mailbox');
// var WsMailbox from ('./mailboxes/ws-mailbox');
/**
 * default mailbox factory
 *
 * @param {Object} serverInfo single server instance info, {id, host, port, ...}
 * @param {Object} opts construct parameters
 * @return {Object} mailbox instancef
 */
function create(serverInfo, opts) {
    // var mailbox = opts.mailbox || 'mqtt';
    // var Mailbox = null;
    // if (mailbox == 'ws') {
    // 	Mailbox = WsMailbox;
    // } else if (mailbox == 'ws2') {
    // 	Mailbox = Ws2Mailbox;
    // } else if (mailbox == 'mqtt') {
    // 	Mailbox = MqttMailbox;
    // }
    return Mailbox.create(serverInfo, opts);
}
exports.create = create;
;
//# sourceMappingURL=mailbox.js.map