import { getLogger } from 'pomelo-logger'
var logger = getLogger('pomelo-rpc', 'rpc-client');
import { failureProcess } from './failureProcess';
import { constants } from '../util/constants';
import * as Station from './mailstation';
import { Tracer } from '../util/tracer';
import * as Loader from 'pomelo-loader';
import * as utils from '../util/utils';
import * as Proxy from '../util/proxy';
import * as router from './router';
import * as async from 'async';

/**
 * Client states
 */
var STATE_INITED = 1; // client has inited
var STATE_STARTED = 2; // client has started
var STATE_CLOSED = 3; // client has closed

/**
 * RPC Client Class
 */
export class Client
{
    _context: any;
    _routeContext: any;
    router: any;
    routerType: any;
    rpcDebugLog: any;
    opts: any;
    proxies: any;
    _station: any;
    state: number;

    constructor(opts)
    {
        opts = opts || {};
        this._context = opts.context;
        this._routeContext = opts.routeContext;
        this.router = opts.router || router.df;
        this.routerType = opts.routerType;
        this.rpcDebugLog = opts.rpcDebugLog;
        if (this._context)
        {
            opts.clientId = this._context.serverId;
        }
        this.opts = opts;
        this.proxies = {};
        this._station = createStation(opts);
        this.state = STATE_INITED;
    };

    /**
     * Start the rpc client which would try to connect the remote servers and
     * report the result by cb.
     *
     * @param cb {Function} cb(err)
     */
    start = function (cb)
    {
        if (this.state > STATE_INITED)
        {
            cb(new Error('rpc client has started.'));
            return;
        }

        var self = this;
        this._station.start(function (err)
        {
            if (err)
            {
                logger.error('[pomelo-rpc] client start fail for ' + err.stack);
                return cb(err);
            }
            self._station.on('error', failureProcess.bind(self._station));
            self.state = STATE_STARTED;
            cb();
        });
    };

    /**
     * Stop the rpc client.
     *
     * @param  {Boolean} force
     * @return {Void}
     */
    stop = function (force)
    {
        if (this.state !== STATE_STARTED)
        {
            logger.warn('[pomelo-rpc] client is not running now.');
            return;
        }
        this.state = STATE_CLOSED;
        this._station.stop(force);
    };

    /**
     * Add a new proxy to the rpc client which would overrid the proxy under the
     * same key.
     *
     * @param {Object} record proxy description record, format:
     *                        {namespace, serverType, path}
     */
    addProxy = function (record)
    {
        if (!record)
        {
            return;
        }
        var proxy = generateProxy(this, record, this._context);
        if (!proxy)
        {
            return;
        }
        insertProxy(this.proxies, record.namespace, record.serverType, proxy);
    };

    /**
     * Batch version for addProxy.
     *
     * @param {Array} records list of proxy description record
     */
    addProxies = function (records)
    {
        if (!records || !records.length)
        {
            return;
        }
        for (var i = 0, l = records.length; i < l; i++)
        {
            this.addProxy(records[i]);
        }
    };

    /**
     * Add new remote server to the rpc client.
     *
     * @param {Object} server new server information
     */
    addServer = function (server)
    {
        this._station.addServer(server);
    };

    /**
     * Batch version for add new remote server.
     *
     * @param {Array} servers server info list
     */
    addServers = function (servers)
    {
        this._station.addServers(servers);
    };

    /**
     * Remove remote server from the rpc client.
     *
     * @param  {String|Number} id server id
     */
    removeServer = function (id)
    {
        this._station.removeServer(id);
    };

    /**
     * Batch version for remove remote server.
     *
     * @param  {Array} ids remote server id list
     */
    removeServers = function (ids)
    {
        this._station.removeServers(ids);
    };

    /**
     * Replace remote servers.
     *
     * @param {Array} servers server info list
     */
    replaceServers = function (servers)
    {
        this._station.replaceServers(servers);
    };

    /**
     * Do the rpc invoke directly.
     *
     * @param serverId {String} remote server id
     * @param msg {Object} rpc message. Message format:
     *    {serverType: serverType, service: serviceName, method: methodName, args: arguments}
     * @param cb {Function} cb(err, ...)
     */
    rpcInvoke = function (serverId, msg, cb)
    {
        var rpcDebugLog = this.rpcDebugLog;
        var tracer = null;

        if (rpcDebugLog)
        {
            tracer = new Tracer(this.opts.rpcLogger, this.opts.rpcDebugLog, this.opts.clientId, serverId, msg);
            tracer.info('client', __filename, 'rpcInvoke', 'the entrance of rpc invoke');
        }

        if (this.state !== STATE_STARTED)
        {
            tracer && tracer.error('client', __filename, 'rpcInvoke', 'fail to do rpc invoke for client is not running');
            logger.error('[pomelo-rpc] fail to do rpc invoke for client is not running');
            cb(new Error('[pomelo-rpc] fail to do rpc invoke for client is not running'));
            return;
        }
        this._station.dispatch(tracer, serverId, msg, this.opts, cb);
    };

    /**
     * Add rpc before filter.
     * 
     * @param filter {Function} rpc before filter function.
     *
     * @api public
     */
    before = function (filter)
    {
        this._station.before(filter);
    };

    /**
     * Add rpc after filter.
     * 
     * @param filter {Function} rpc after filter function.
     *
     * @api public
     */
    after = function (filter)
    {
        this._station.after(filter);
    };

    /**
     * Add rpc filter.
     * 
     * @param filter {Function} rpc filter function.
     *
     * @api public
     */
    filter = function (filter)
    {
        this._station.filter(filter);
    };

    /**
     * Set rpc filter error handler.
     * 
     * @param handler {Function} rpc filter error handler function.
     *
     * @api public
     */
    setErrorHandler = function (handler)
    {
        this._station.handleError = handler;
    };
}

/**
 * Create mail station.
 *
 * @param opts {Object} construct parameters.
 *
 * @api private
 */
var createStation = function (opts)
{
    return Station.create(opts);
};

/**
 * Generate proxies for remote servers.
 *
 * @param client {Object} current client instance.
 * @param record {Object} proxy reocrd info. {namespace, serverType, path}
 * @param context {Object} mailbox init context parameter
 *
 * @api private
 */
var generateProxy = function (client, record, context)
{
    if (!record)
    {
        return;
    }
    var res, name;
    var modules = Loader.load(record.path, context);
    if (modules)
    {
        res = {};
        for (name in modules)
        {
            res[name] = Proxy.create({
                service: name,
                origin: modules[name],
                attach: record,
                proxyCB: proxyCB.bind(null, client)
            });
        }
    }
    return res;
};

/**
 * Generate prxoy for function type field
 *
 * @param client {Object} current client instance.
 * @param serviceName {String} delegated service name.
 * @param methodName {String} delegated method name.
 * @param args {Object} rpc invoke arguments.
 * @param attach {Object} attach parameter pass to proxyCB.
 * @param isToSpecifiedServer {boolean} true means rpc route to specified remote server.
 *
 * @api private
 */
var proxyCB = function (client, serviceName, methodName, args, attach, isToSpecifiedServer)
{
    if (client.state !== STATE_STARTED)
    {
        Promise.reject(new Error('[pomelo-rpc] fail to invoke rpc proxy for client is not running'));
        return;
    }
    if (args.length < 2)
    {

        logger.error('[pomelo-rpc] invalid rpc invoke, arguments length less than 2, namespace: %j, serverType, %j, serviceName: %j, methodName: %j',
            attach.namespace, attach.serverType, serviceName, methodName);
        Promise.reject(new Error('[pomelo-rpc] invalid rpc invoke, arguments length less than 2'));
        return;
    }
    var routeParam = args.shift();
    var serverType = attach.serverType;
    var msg = {
        namespace: attach.namespace,
        serverType: serverType,
        service: serviceName,
        method: methodName,
        args: args
    };

    return new Promise(function (resolve, reject)
    {
        if (isToSpecifiedServer)
        {
            rpcToSpecifiedServer(client, msg, serverType, routeParam, resolve);
        }
        else
        {
            getRouteTarget(client, serverType, msg, routeParam, function (err, serverId)
            {
                if (err)
                {
                    return resolve(err);
                }

                client.rpcInvoke(serverId, msg, function (err, resp)
                {
                    if (err != null)
                    {
                        reject(err);
                    }
                    else
                    {
                        resolve(resp);
                    }
                });
            });
        }
    });
};

/**
 * Calculate remote target server id for rpc client.
 *
 * @param client {Object} current client instance.
 * @param serverType {String} remote server type.
 * @param routeParam {Object} mailbox init context parameter.
 * @param cb {Function} return rpc remote target server id.
 *
 * @api private
 */
var getRouteTarget = function (client, serverType, msg, routeParam, cb)
{
    if (!!client.routerType)
    {
        var method;
        switch (client.routerType)
        {
            case constants.SCHEDULE.ROUNDROBIN:
                method = router.rr;
                break;
            case constants.SCHEDULE.WEIGHT_ROUNDROBIN:
                method = router.wrr;
                break;
            case constants.SCHEDULE.LEAST_ACTIVE:
                method = router.la;
                break;
            case constants.SCHEDULE.CONSISTENT_HASH:
                method = router.ch;
                break;
            default:
                method = router.rd;
                break;
        }
        method.call(null, client, serverType, msg, function (err, serverId)
        {
            cb(err, serverId);
        });
    } else
    {
        var route, target;
        if (typeof client.router === 'function')
        {
            route = client.router;
            target = null;
        } else if (typeof client.router.route === 'function')
        {
            route = client.router.route;
            target = client.router;
        } else
        {
            logger.error('[pomelo-rpc] invalid route function.');
            return;
        }
        route.call(target, routeParam, msg, client._routeContext, function (err, serverId)
        {
            cb(err, serverId);
        });
    }
};

/**
 * Rpc to specified server id or servers.
 *
 * @param client     {Object} current client instance.
 * @param msg        {Object} rpc message.
 * @param serverType {String} remote server type.
 * @param serverId   {Object} mailbox init context parameter.
 *
 * @api private
 */
var rpcToSpecifiedServer = function (client, msg, serverType, serverId, cb)
{
    if (typeof serverId !== 'string')
    {
        logger.error('[pomelo-rpc] serverId is not a string : %s', serverId);
        return;
    }
    if (serverId === '*')
    {
        var servers = client._routeContext.getServersByType(serverType);
        if (!servers)
        {
            logger.error('[pomelo-rpc] serverType %s servers not exist', serverType);
            return;
        }

        async.each(servers, function (server, next)
        {
            var serverId = server['id'];
            client.rpcInvoke(serverId, msg, function (err)
            {
                next(err);
            });
        }, cb);
    } else
    {
        client.rpcInvoke(serverId, msg, cb);
    }
};

/**
 * Add proxy into array.
 * 
 * @param proxies {Object} rpc proxies
 * @param namespace {String} rpc namespace sys/user
 * @param serverType {String} rpc remote server type
 * @param proxy {Object} rpc proxy
 *
 * @api private
 */
var insertProxy = function (proxies, namespace, serverType, proxy)
{
    proxies[namespace] = proxies[namespace] || {};
    if (proxies[namespace][serverType])
    {
        for (var attr in proxy)
        {
            proxies[namespace][serverType][attr] = proxy[attr];
        }
    } else
    {
        proxies[namespace][serverType] = proxy;
    }
};

/**
 * RPC client factory method.
 *
 * @param  {Object}      opts client init parameter.
 *                       opts.context: mail box init parameter,
 *                       opts.router: (optional) rpc message route function, route(routeParam, msg, cb),
 *                       opts.mailBoxFactory: (optional) mail box factory instance.
 * @return {Object}      client instance.
 */
export function create(opts)
{
    return new Client(opts);
};

// module.exports.WSMailbox from ('./mailboxes/ws-mailbox'); // socket.io 
// module.exports.WS2Mailbox from ('./mailboxes/ws2-mailbox'); // ws
export { create as MQTTMailbox } from './mailboxes/mqtt-mailbox'; // mqtt
