/**
 * Winston logger file
 * Created by vladimir
 */
const winstonLog = require('winston');
// const Configuration = require('./config');

// const logFile = Configuration.logging.logFilePath + Configuration.logging.logFileName;
const logFile = process.env.LOG_PATH + process.env.LOG_FILE_NAME;
var winston = new (winstonLog.Logger)({
  transports: [
    new (winstonLog.transports.Console)({ level: 'debug' }),
    new (winstonLog.transports.File)({ filename: logFile })
  ]
});

winston.info('The logs are being captured 2 ways - console and file');

module.exports = winston;