#!/usr/bin/env node
/**
 * cluster script - https://github.com/learnboost/cluster
*/

var cluster = require('cluster');

cluster('./server.js')
	//.use(cluster.logger('logs'))
	//.use(cluster.pidfiles('pids'))
	.use(cluster.stats())
	.use(cluster.cli())
	.use(cluster.repl(8888))
	.listen(8667);
