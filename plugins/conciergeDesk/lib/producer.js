const Joi = require('joi');
const Boom = require('boom');
const Calibrate = require('calibrate');
const logger = require('../../../logger');
// loads model file and engine
const serviceOffers = require('../models/ServiceOffersModel');


// define internals
var internals = {};

// exports.getServiceOffers = {
//   description: "Get service offers from db.",
//   tags: ['api'],
//   auth: false,
//   validate: {
//     query: {
//       interests: Joi.string().required().description("Array of services that consumer what to query")
//     }
//   },
//   handler: function (request, reply) {
//     internals.getOffers(request.query, function (err, data) {
//       if (err != null && typeof err.code !== 'undefined' && err.code != 200) {
//         reply(Calibrate(Boom.badData(err.message, err)));
//       } else {
//         reply(Calibrate(data));
//       }
//     });
//   }
// }

exports.createServiceOffer = {
  description: "Create service offer in database.",
  tags: ['api'],
  auth: false,
  validate: {
    query: {
      serviceName: Joi.string().required().description("Service Name that will be used for offer"),
      serviceOffer: Joi.string().required().description("Service Offer is string with all details that app need to access service."),
      availableUntil: Joi.string().required().description("Date/time until when service offer is available"),
      registeredByAppName: Joi.string().required().description("Name of the app (service) that register this service. This is not app account name"),
      isAliveCheck: Joi.object().required().description('Object that define do we need to check is service that promote offer still alive or not.')
    }
  },
  handler: function (request, reply) {
    internals.createServiceOffer(request.query, function (err, data) {
      if (err != null && typeof err.code !== 'undefined' && err.code != 200) {
        reply(Calibrate(Boom.badData(err.message, err)));
      } else {
        reply(Calibrate(data));
      }
    });
  }
}

internals.createServiceOffer = function(query, callback) {
  
}