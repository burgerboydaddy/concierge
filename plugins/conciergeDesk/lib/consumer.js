const Joi = require('joi');
const Boom = require('boom');
const Calibrate = require('calibrate');
// const Configuration = require('../../../config');
const logger = require('../../../logger');

// define internals
var internals = {};

exports.getConsumer = {
  description: "process consumer request.",
  tags: ['api'],
  auth: false,
  validate: {
    query: {
      oldSEAPCollection: Joi.string().allow('').description("Collection with old SEAP records. Default name: oldPartners")
    }
  },
  handler: function (request, reply) {
    internals.processConsumer(request.query, function (err, data) {
      if (err != null && typeof err.code !== 'undefined' && err.code != 200) {
        reply(Calibrate(Boom.badData(err.message, err)));
      } else {
        reply(Calibrate(data));
      }
    });
  }
}

internals.processConsumer = function(query, callback) {


  callback(200, 'ok');
}