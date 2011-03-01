#!/usr/bin/env node
/**
 * cluster script - https://github.com/learnboost/cluster
*/

var cluster = require('cluster');

cluster('./server.js')
	.set('workers', 1)	// only 1 workers
	.use(cluster.logger('logs'))
	.use(cluster.stats())
	.use(cluster.pidfiles('pids'))
	.use(cluster.cli())
	.use(cluster.repl(8888))
	.listen(8667);
