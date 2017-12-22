import { getLogger } from 'pomelo-logger'
var logger = getLogger('pomelo-rpc', 'blackhole');
import { EventEmitter } from 'events';
import * as utils from '../../util/utils';

export class Blackhole extends EventEmitter
{
	connect(tracer, cb)
	{
		tracer && tracer.info('client', __filename, 'connect', 'connect to blackhole');
		process.nextTick(function ()
		{
			cb(new Error('fail to connect to remote server and switch to blackhole.'));
		});
	};

	close(cb) { };

	send(tracer, msg, opts, cb)
	{
		tracer && tracer.info('client', __filename, 'send', 'send rpc msg to blackhole');
		logger.info('message into blackhole: %j', msg);
		process.nextTick(function ()
		{
			cb(tracer, new Error('message was forward to blackhole.'));
		});
	};
}