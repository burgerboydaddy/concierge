// Load modules
const Routes = require('./routes');
const accountModel = require('../models/AccountModel');
const Bcrypt = require('bcrypt');

exports.register = function (plugin, options, next) {
  plugin.register(require('hapi-auth-basic'), (err) => {
    plugin.auth.strategy('simple', 'basic', { validateFunc: validate });
  });
  plugin.route(Routes.endpoints);
  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};

/**
 * It is expected that user pass account key and account secret that will be validated
 * against account db.
 * @param request
 * @param accountKey
 * @param accountSecret
 * @param callback
 */
const validate = function (request, accountKey, accountSecret, callback) {
  // find account in db first
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
};