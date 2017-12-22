/**
 * Default mailbox factory
 */
import * as Mailbox from './mailboxes/mqtt-mailbox';
/**
 * default mailbox factory
 *
 * @param {Object} serverInfo single server instance info, {id, host, port, ...}
 * @param {Object} opts construct parameters
 * @return {Object} mailbox instancef
 */
export declare function create(serverInfo: any, opts: any): Mailbox.MailBox;
