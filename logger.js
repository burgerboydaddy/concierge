/**
 * Winston logger file
 */
'use strict';
const winstonLog = require('winston');
// const Configuration = require('./config');


let logPath = process.env.LOG_PATH || '/var/log/';
let logFileName = process.env.LOG_FILE_NAME || 'concierge.log';
const logFile = logPath + logFileName;
// const logFile = process.env.LOG_PATH + process.env.LOG_FILE_NAME;
var winston = new (winstonLog.Logger)({
  transports: [
    new (winstonLog.transports.Console)({ level: 'debug' }),
    new (winstonLog.transports.File)({ filename: logFile })
  ]
});

winston.info('The logs are being captured 2 ways - console and file');
module.exports = winston;