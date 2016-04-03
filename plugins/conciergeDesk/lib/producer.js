const Joi = require('joi');
const Boom = require('boom');
const Calibrate = require('calibrate');
const logger = require('../../../logger');
// loads model file and engine
const serviceOfferModel = require('../models/ServiceOffersModel');


// define internals
var internals = {};

exports.getServiceOffers = {
  description: "Get service offers from db.",
  tags: ['api'],
  auth: false,
  validate: {
    query: {
      interests: Joi.array().items(Joi.string()).required().description("Array of services that consumer what to query")
    }
  },
  handler: function (request, reply) {
    internals.getOffers(request.query, function (err, data) {
      if (err != null && typeof err.code !== 'undefined' && err.code != 200) {
        reply(Calibrate(Boom.badData(err.message, err)));
      } else {
        reply(Calibrate(data));
      }
    });
  }
}

exports.createServiceOffer = {
  description: "Create service offer in database.",
  tags: ['api'],
  auth: false,
  validate: {
    params: false,
    payload: {
      serviceName: Joi.string().required().description("Service Name that will be used for offer"),
      serviceOffer: Joi.string().required().description("Service Offer is string with all details that app need to access service."),
      availableUntil: Joi.date().min('now').required().description("Date/time until when service offer is available"),
      registeredByAppName: Joi.string().required().description("Name of the app (service) that register this service. This is not app account name"),
      isAliveCheck: Joi.object().keys({
        checkIsAlive: Joi.boolean().required().description("Set to true if you want to check is service available."),
        isAliveCheckURL: Joi.string().allow('').description("URL for service health ping"),
        isAliveCheckInterval: Joi.number().integer().min(0).max(3600).description("Is alive check interval in seconds. 0 == do not check, max 3600sec.")
      }).required().description('Object that define do we need to check is service that promote offer still alive or not.')
    }
  },
  handler: function (request, reply) {
    internals.createServiceOffer(request.payload, function (err, data) {
      if (err != null && typeof err.code !== 'undefined' && err.code != 200) {
        reply(Calibrate(Boom.badData(err.message, err)));
      } else {
        reply(Calibrate(data));
      }
    });
  }
}

internals.getOffers = function(query, callback) {

  // Find serviceOffers for all listed interests.
  // Only return enabled offers, and one that didn't expire
  var dbQuery = {
    "$and":[
      {
        "serviceName": {"$in": query.interests}
      },
      {
        "availableUntil":  { "$gte": new Date() }
      }
    ]
  };
  var returnFields = {_id:0, serviceName:1, serviceOffer:1};
    serviceOfferModel.find(dbQuery, returnFields, function(err, doc) {
    var messages = [];
    var errors = null;
    if (!err) {
      errors = {
        statusCode: 200,
        message: 'Ok',
        serviceOffers: doc
      };
    } else {
      errors = {
        statusCode: 409,
        code: err.code,
        message: err.message,
        serviceOffers: null
      };
      messages.push(err.errors);
      messages.push(err.message);
      messages.push({"interests": query.interests});
      logger.info("internals.getOffers - Errors getting service Offers in db: ", messages);
    }
    callback(200, errors);
  });
}

internals.createServiceOffer = function(payload, callback) {
  var serviceOffer = new serviceOfferModel();
  serviceOffer.serviceName = payload.serviceName;
  serviceOffer.serviceOffer = payload.serviceOffer;
  serviceOffer.availableUntil = payload.availableUntil;
  serviceOffer.registeredBy = payload.registeredBy;
  serviceOffer.isAliveCheck = {
    checkIsAlive: payload.isAliveCheck.checkIsAlive,
    isAliveCheckURL: payload.isAliveCheck.isAliveCheckURL,
    isAliveCheckInterval: payload.isAliveCheck.isAliveCheckInterval
  };

  var serviceOfferToUpdate = {};
  serviceOfferToUpdate = Object.assign(serviceOfferToUpdate, serviceOffer._doc);
  delete serviceOfferToUpdate._id;
  // findOne and Update; or if object doesn't exist upsert
  var dbQuery = {"serviceName": payload.serviceName};
  var options = {new:true, upsert:true};
  serviceOfferModel.findOneAndUpdate(dbQuery, serviceOfferToUpdate, options, function (err, doc) {
    var messages = [];
    var errors = null;
    if (!err) {
      errors = {
        statusCode: 200,
        message: 'Ok',
        serviceOffer: doc
      };
    } else {
      errors = {
        statusCode: 409,
        code: err.code,
        message: err.message,
        serviceOffer: null
      };
      messages.push(err.errors);
      messages.push(err.message);
      messages.push({"accountKey": query.accountKey});
      logger.info("internals.createServiceOffer - Errors saving service offer in db: ", messages);
    }
    callback(200, errors);
  });
}