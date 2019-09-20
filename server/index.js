const socketServer = require("./endpoints/socket.js");
const postServer = require("./endpoints/post.js");
const oAuthServer = require("./endpoints/oAuth.js");

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = process.env.PORT || 56556 

postServer.createWebServer(app, server, port);
socketServer.createSocketServer(server);
oAuthServer.createOAuthServer(app);