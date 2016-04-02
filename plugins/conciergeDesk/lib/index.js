// Load modules
const Routes = require('./routes');

exports.register = function (plugin, options, next) {
  plugin.route(Routes.endpoints);
  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};