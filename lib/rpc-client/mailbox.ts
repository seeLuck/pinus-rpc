/**
 * Default mailbox factory
 */
import * as Mailbox from './mailboxes/mqtt-mailbox';
// var Ws2Mailbox from ('./mailboxes/ws2-mailbox');
// var WsMailbox from ('./mailboxes/ws-mailbox');

/**
 * default mailbox factory
 *
 * @param {Object} serverInfo single server instance info, {id, host, port, ...}
 * @param {Object} opts construct parameters
 * @return {Object} mailbox instancef
 */
export function create (serverInfo, opts)
{
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
};