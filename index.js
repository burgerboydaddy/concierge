/**
 * Concierge micro service
 * Created on: 2016-04-01
 * Version 0.1
 */

'use strict';
// Load .env config for development environments
require('dotenv').config({ silent: true });

const pkg = require('./package.json');

const Hapi = require('hapi');
const logger = require('./logger');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');
var mongoose = require('mongoose');

require('events').EventEmitter.prototype._maxListeners = 100;

// Open DB connection
global.mongo = process.env.DB_CONNECTION || 'mongodb://localhost/' + pkg.name;
console.log("my db:", global.mongo);
global.db = mongoose.connect(mongo);

// Add scripts from updates folder
// TODO: make this as auto discovery!
var updateAccounts = require('./updates/0.0.1.account');
updateAccounts();

const server = new Hapi.Server();

server.connection({
  host: process.env.APP_HOST || 'localhost',
  port: process.env.APP_PORT || 8001,
  router: {stripTrailingSlash: true}
});

const swaggerOptions = {
  enableDocumentation: true,
  info: {
    title: 'Concierge',
    version: Pack.version,
    description: 'This API is created for services and apps discovery.'
  }
};

server.register([
  Inert,
  Vision,
  {
    'register': HapiSwagger,
    'options': swaggerOptions
  },
  {
    register: require("./plugins/conciergeDesk"),
    options: {
      basePath: server.info.uri
    }
  }
], function (err) {
  if (err) {
    logger.error('Failed to load a plugin:', err);
    throw err;
  }
  server.start((err) => {
    if (err) {
      throw err;
    }
    logger.info('Server started at: ' + server.info.uri + ' with [' + Object.keys(server.plugins).join(', ') + '] enabled');
  });

});