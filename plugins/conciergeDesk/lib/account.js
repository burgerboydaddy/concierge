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

exports.getAccount = {
  description: "Get account from db.",
  tags: ['api'],
  auth: false,
  // auth: 'simple',
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

exports.updateAccountSecret = {
  description: "Update account secret that will be used for accessing service.",
  tags: ['api'],
  auth: 'simple',
  validate: {
    params: false,
    payload: {
      accountKey: Joi.string().required().description("Account key"),
      oldAccountSecret: Joi.string().required().description("Old account secret"),
      newAccountSecret: Joi.string().required().description("New account secret")
    }
  },
  handler: function (request, reply) {
    internals.updateAccountSecret(request.payload, function (err, data) {
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

internals.updateAccountSecret = function(payload, callback) {
  internals.validateSecret(payload.accountKey, payload.oldAccountSecret, function(err, isValid, account) {
    if(isValid) {
      var account = new accountModel();
      Bcrypt.genSalt(10, function(err, salt) {
        Bcrypt.hash(payload.newAccountSecret, salt, function(err, hash) {
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
              logger.info("internals.updateAccountSecret - Errors updating account secret in db: ", messages);
            }
            callback(200, errors);
          });
        });
      });
    } else {
      let errors = {
        statusCode: 403,
        code: 403,
        message: 'Old secret does not match.',
        account: null
      };
      callback(403, errors);
    }
  });

}

internals.validateSecret = function(accountKey, accountSecret, callback) {
  var dbQuery = {"accountKey": accountKey};
  accountModel.findOne(dbQuery, function(err, doc) {
    if(typeof doc == 'undefined' || doc == null) {
      return callback(null, false);
    } else {
      Bcrypt.compare(accountSecret, doc.accountSecret, (err, isValid) => {
        callback(err, isValid, { accountName: doc.accountName, accountKey: doc.accountKey });
      });
    }
  });
}