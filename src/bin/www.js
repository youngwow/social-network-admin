#!/usr/bin/env node

/**
 * Module dependencies.
 */
const app = require('../app');
const debug = require('debug')('lab3-network:server');
const https = require('https');
const fs = require('fs')
/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */
const options = {
  key: fs.readFileSync("C:\\\\cert\\\\privateKey.key", "utf8"),
  cert: fs.readFileSync("C:\\\\cert\\\\certificate.crt", "utf8")
};
const server = https.createServer(options, app);

const io = require('socket.io')(server, {
  cors: {
    origins: ["*"],
    handlePreflightRequest: (req, res) => {
      res.writeHead(200, {
        "Access-Control-Allow-Credintals": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,GET,HEAD,PATCH,DELETE",
      });
      res.end();
    }
  }});

global.subscribers = [];

io.sockets.on("connection", (socket) => {
  console.log("success");

  socket.on("disconnect", () => {
    console.log("dis");
  });

  socket.on("news-subscribe", (args)=> {
    if(args.token) {
      console.log("sub");
      subscribers[args.token] = {token: args.token, socket};
      console.log(subscribers);
    }
  });
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const address = server.address();
  const bind = typeof address === 'string'
      ? 'pipe ' + address
      : 'port ' + address.port;
  debug('Listening on ' + bind);
}

// module.exports.subscribers = subscribers;
