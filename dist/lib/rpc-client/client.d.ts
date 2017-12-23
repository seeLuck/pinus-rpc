/**
 * RPC Client Class
 */
export declare class RpcClient {
    _context: any;
    _routeContext: any;
    router: any;
    routerType: any;
    rpcDebugLog: any;
    opts: any;
    proxies: any;
    _station: any;
    state: number;
    constructor(opts: any);
    /**
     * Start the rpc client which would try to connect the remote servers and
     * report the result by cb.
     *
     * @param cb {Function} cb(err)
     */
    start(cb: any): void;
    /**
     * Stop the rpc client.
     *
     * @param  {Boolean} force
     * @return {Void}
     */
    stop(force: any): void;
    /**
     * Add a new proxy to the rpc client which would overrid the proxy under the
     * same key.
     *
     * @param {Object} record proxy description record, format:
     *                        {namespace, serverType, path}
     */
    addProxy(record: any): void;
    /**
     * Batch version for addProxy.
     *
     * @param {Array} records list of proxy description record
     */
    addProxies(records: any): void;
    /**
     * Add new remote server to the rpc client.
     *
     * @param {Object} server new server information
     */
    addServer(server: any): void;
    /**
     * Batch version for add new remote server.
     *
     * @param {Array} servers server info list
     */
    addServers(servers: any): void;
    /**
     * Remove remote server from the rpc client.
     *
     * @param  {String|Number} id server id
     */
    removeServer(id: any): void;
    /**
     * Batch version for remove remote server.
     *
     * @param  {Array} ids remote server id list
     */
    removeServers(ids: any): void;
    /**
     * Replace remote servers.
     *
     * @param {Array} servers server info list
     */
    replaceServers(servers: any): void;
    /**
     * Do the rpc invoke directly.
     *
     * @param serverId {String} remote server id
     * @param msg {Object} rpc message. Message format:
     *    {serverType: serverType, service: serviceName, method: methodName, args: arguments}
     * @param cb {Function} cb(err, ...)
     */
    rpcInvoke(serverId: any, msg: any, cb: any): void;
    /**
     * Add rpc before filter.
     *
     * @param filter {Function} rpc before filter function.
     *
     * @api public
     */
    before(filter: any): void;
    /**
     * Add rpc after filter.
     *
     * @param filter {Function} rpc after filter function.
     *
     * @api public
     */
    after(filter: any): void;
    /**
     * Add rpc filter.
     *
     * @param filter {Function} rpc filter function.
     *
     * @api public
     */
    filter(filter: any): void;
    /**
     * Set rpc filter error handler.
     *
     * @param handler {Function} rpc filter error handler function.
     *
     * @api public
     */
    setErrorHandler(handler: any): void;
}
/**
 * RPC client factory method.
 *
 * @param  {Object}      opts client init parameter.
 *                       opts.context: mail box init parameter,
 *                       opts.router: (optional) rpc message route function, route(routeParam, msg, cb),
 *                       opts.mailBoxFactory: (optional) mail box factory instance.
 * @return {Object}      client instance.
 */
export declare function create(opts: any): RpcClient;
export { create as MQTTMailbox } from './mailboxes/mqtt-mailbox';
