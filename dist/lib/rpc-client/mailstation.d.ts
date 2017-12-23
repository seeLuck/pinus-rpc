/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Mail station constructor.
 *
 * @param {Object} opts construct parameters
 */
export declare class MailStation extends EventEmitter {
    servers: {};
    serversMap: {};
    onlines: {};
    befores: any[];
    afters: any[];
    pendings: {};
    connecting: {};
    mailboxes: {};
    state: number;
    opts: any;
    mailboxFactory: any;
    pendingSize: number;
    constructor(opts: any);
    /**
     * Init and start station. Connect all mailbox to remote servers.
     *
     * @param  {Function} cb(err) callback function
     * @return {Void}
     */
    start(cb: any): void;
    /**
     * Stop station and all its mailboxes
     *
     * @param  {Boolean} force whether stop station forcely
     * @return {Void}
     */
    stop(force: any): void;
    /**
     * Add a new server info into the mail station and clear
     * the blackhole associated with the server id if any before.
     *
     * @param {Object} serverInfo server info such as {id, host, port}
     */
    addServer(serverInfo: any): void;
    /**
     * Batch version for add new server info.
     *
     * @param {Array} serverInfos server info list
     */
    addServers(serverInfos: any): void;
    /**
     * Remove a server info from the mail station and remove
     * the mailbox instance associated with the server id.
     *
     * @param  {String|Number} id server id
     */
    removeServer(id: any): void;
    /**
     * Batch version for remove remote servers.
     *
     * @param  {Array} ids server id list
     */
    removeServers(ids: any): void;
    /**
     * Clear station infomation.
     *
     */
    clearStation(): void;
    /**
     * Replace remote servers info.
     *
     * @param {Array} serverInfos server info list
     */
    replaceServers(serverInfos: any): void;
    /**
     * Dispatch rpc message to the mailbox
     *
     * @param  {Object}   tracer   rpc debug tracer
     * @param  {String}   serverId remote server id
     * @param  {Object}   msg      rpc invoke message
     * @param  {Object}   opts     rpc invoke option args
     * @param  {Function} cb       callback function
     * @return {Void}
     */
    dispatch(tracer: any, serverId: any, msg: any, opts: any, cb: any): void;
    /**
     * Add a before filter
     *
     * @param  {[type]} filter [description]
     * @return {[type]}        [description]
     */
    before(filter: any): void;
    /**
     * Add after filter
     *
     * @param  {[type]} filter [description]
     * @return {[type]}        [description]
     */
    after(filter: any): void;
    /**
     * Add before and after filter
     *
     * @param  {[type]} filter [description]
     * @return {[type]}        [description]
     */
    filter(filter: any): void;
    /**
     * Try to connect to remote server
     *
     * @param  {Object}   tracer   rpc debug tracer
     * @return {String}   serverId remote server id
     * @param  {Function}   cb     callback function
     */
    connect(tracer: any, serverId: any, cb: any): void;
}
/**
 * Mail station factory function.
 *
 * @param  {Object} opts construct paramters
 *           opts.servers {Object} global server info map. {serverType: [{id, host, port, ...}, ...]}
 *           opts.mailboxFactory {Function} mailbox factory function
 * @return {Object}      mail station instance
 */
export declare function create(opts: any): MailStation;
