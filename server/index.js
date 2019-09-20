var assert = require('assert')
var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)
var request = require('request')
var https = require('https')
var http = require('http')
var port = process.env.PORT || 56556 

