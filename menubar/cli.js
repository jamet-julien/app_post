#!/usr/bin/env electron

var menubar = require('./');
var args    = require('minimist')(process.argv.slice(2));

args.dir = args._[0];

menubar( args);
