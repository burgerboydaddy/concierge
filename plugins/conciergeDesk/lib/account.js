'use strict';
const Joi = require('joi');
const Boom = require('boom');
const Calibrate = require('calibrate');
// loads model file and engine
const accountModel = require('../models/AccountModel');
const logger = require('../../../logger');
const Bcrypt = require('bcrypt');

// define internals
var internals = {};

// // Next one is for test purpose only
// exports.getHi = {
//   description: "Get hi from account.",
//   tags: ['api'],
//   auth: 'simple',
//   validate: {
//     query: {
//       accountKey: Joi.string().required().description("Account key")
//     }
//   },
//   handler: function (request, reply) {
//     console.log(request.auth.credentials);
//     reply('hello, ' + request.auth.credentials.accountName);
//   }
// }

exports.getAccount = {
  description: "Get account from db.",
  tags: ['api'],
  // auth: false,
  auth: 'simple',
  validate: {
    query: {
      accountKey: Joi.string().required().description("Account key")
    }
  },
  handler: function (request, reply) {
    internals.getAccount(request.query, function (err, data) {
      if (err != null && typeof err.code !== 'undefined' && err.code != 200) {
        reply(Calibrate(Boom.badData(err.message, err)));
      } else {
        reply(Calibrate(data));
      }
    });
  }
}

exports.createAccount = {
  description: "Create account that will be used for accessing service.",
  tags: ['api'],
  auth: 'simple',
  validate: {
    params: false,
    payload: {
      accountName: Joi.string().required().description("Account Name"),
      accountKey: Joi.string().required().description("Account key"),
      accountSecret: Joi.string().required().description("Account secret")
    }
  },
  handler: function (request, reply) {
    internals.createAccount(request.payload, function (err, data) {
      if (err != null && typeof err.code !== 'undefined' && err.code != 200) {
        reply(Calibrate(Boom.badData(err.message, err)));
      } else {
        reply(Calibrate(data));
      }
    });
  }
}

internals.getAccount = function (query, callback) {
  var dbQuery = {"accountKey": query.accountKey};
  accountModel.find(dbQuery, function(err, doc) {
    var messages = [];
    var errors = null;
    if (!err) {
      errors = {
        statusCode: 200,
        message: 'Ok',
        account: doc
      };
    } else {
      errors = {
        statusCode: 409,
        code: err.code,
        message: err.message,
        account: null
      };
      messages.push(err.errors);
      messages.push(err.message);
      messages.push({"accountKey": query.accountKey});
      logger.info("internals.getAccount - Errors getting account in db: ", messages);
    }
    callback(200, errors);
  });
}

internals.createAccount = function(payload, callback) {
  var account = new accountModel();
  account.accountName = payload.accountName;
  account.accountKey = payload.accountKey;
  Bcrypt.genSalt(10, function(err, salt) {
    Bcrypt.hash(payload.accountSecret, salt, function(err, hash) {
      account.accountSecret = hash;

      var accountToUpdate = {};
      accountToUpdate = Object.assign(accountToUpdate, account._doc);
      delete accountToUpdate._id;
      // findOne and Update; or if object doesn't exist upsert
      var dbQuery = {"accountKey": payload.accountKey};
      var options = {new:true, upsert:true};
      accountModel.findOneAndUpdate(dbQuery, accountToUpdate, options, function (err, doc) {
        var messages = [];
        var errors = null;
        if (!err) {
          errors = {
            statusCode: 200,
            message: 'Ok',
            account: doc
          };
        } else {
          errors = {
            statusCode: 409,
            code: err.code,
            message: err.message,
            account: null
          };
          messages.push(err.errors);
          messages.push(err.message);
          messages.push({"accountKey": payload.accountKey});
          logger.info("internals.createAccount - Errors saving account in db: ", messages);
        }
        callback(200, errors);
      });
    });
  });
}