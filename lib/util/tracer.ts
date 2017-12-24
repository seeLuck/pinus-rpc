import * as uuid from 'uuid';
import { Logger } from 'log4js';

var getModule = function (module : string)
{
    var rs = '';
    var strs = module.split('/');
    var lines = strs.slice(-3);
    for (var i = 0; i < lines.length; i++)
    {
        rs += '/' + lines[i];
    }
    return rs;
};
export class Tracer
{
    private isEnabled: boolean;
    private logger: any;
    private source: string;
    private remote: string;
    private id: string;
    private seq: number;
    private msg: string;

    constructor(logger : Logger, enabledRpcLog : boolean, source : string, remote : string, msg : string, id ?: string, seq ?: number)
    {
        this.isEnabled = enabledRpcLog;
        if (!enabledRpcLog)
        {
            return;
        }
        this.logger = logger;
        this.source = source;
        this.remote = remote;
        this.id = id || uuid.v1();
        this.seq = seq || 1;
        this.msg = msg;
    };

    getLogger(role : string, module : string, method : string, des : string)
    {
        return {
            traceId: this.id,
            seq: this.seq++,
            role: role,
            source: this.source,
            remote: this.remote,
            module: getModule(module),
            method: method,
            args: this.msg,
            timestamp: Date.now(),
            description: des
        };
    };

    info(role : string, module : string, method : string, des : string)
    {
        if (this.isEnabled)
        {
            this.logger.info(JSON.stringify(this.getLogger(role, module, method, des)));
        }
        return;
    };

    debug(role : string, module : string, method : string, des : string)
    {
        if (this.isEnabled)
        {
            this.logger.debug(JSON.stringify(this.getLogger(role, module, method, des)));
        }
        return;
    };

    error(role : string, module : string, method : string, des : string)
    {
        if (this.isEnabled)
        {
            this.logger.error(JSON.stringify(this.getLogger(role, module, method, des)));
        }
        return;
    };
}