import * as defaultAcceptorFactory from './acceptor';
import { EventEmitter } from 'events';
import { Dispatcher } from './dispatcher';
import * as Loader from 'pinus-loader';
import * as utils from '../util/utils';
import * as util from 'util';
import * as fs from 'fs';

export class Gateway extends EventEmitter
{
    opts: any;
    port: number;
    started = false;
    stoped = false;
    services: any;
    acceptor: any;
    constructor(opts)
    {
        super();
        this.opts = opts || {};
        this.port = opts.port || 3050;
        this.started = false;
        this.stoped = false;
        var acceptorFactory = opts.acceptorFactory || defaultAcceptorFactory;
        this.services = opts.services;
        var dispatcher = new Dispatcher(this.services);
        if (!!this.opts.reloadRemotes)
        {
            this.watchServices(dispatcher);
        }
        this.acceptor = acceptorFactory.create(opts, function (tracer, msg, cb)
        {
            dispatcher.route(tracer, msg, cb);
        });
    };


    stop(force : boolean)
    {
        if (!this.started || this.stoped)
        {
            return;
        }
        this.stoped = true;
        try
        {
            this.acceptor.close();
        } catch (err) { }
    };

    start()
    {
        if (this.started)
        {
            throw new Error('gateway already start.');
        }
        this.started = true;

        var self = this;
        this.acceptor.on('error', self.emit.bind(self, 'error'));
        this.acceptor.on('closed', self.emit.bind(self, 'closed'));
        this.acceptor.listen(this.port);
    };

    
    watchServices(dispatcher : Dispatcher)
    {
        var paths = this.opts.paths;
        var app = this.opts.context;
        for (var i = 0; i < paths.length; i++)
        {
            (function (index)
            {
                fs.watch(paths[index].path, function (event, name)
                {
                    if (event === 'change')
                    {
                        var res = {};
                        var item = paths[index];
                        var m = Loader.load(item.path, app);
                        if (m)
                        {
                            createNamespace(item.namespace, res);
                            for (var s in m)
                            {
                                res[item.namespace][s] = m[s];
                            }
                        }
                        dispatcher.emit('reload', res);
                    }
                });
            })(i);
        }
    };
}
/**
 * create and init gateway
 *
 * @param opts {services: {rpcServices}, connector:conFactory(optional), router:routeFunction(optional)}
 */
export function create(opts)
{
    if (!opts || !opts.services)
    {
        throw new Error('opts and opts.services should not be empty.');
    }

    return new Gateway(opts);
};


var createNamespace = function (namespace, proxies)
{
    proxies[namespace] = proxies[namespace] || {};
};