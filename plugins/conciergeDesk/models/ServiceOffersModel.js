/**
 * Db schemas for serviceOffers
 * version: 0.1
 */
'use strict';

const Schema = db.Schema;
const ObjectId = Schema.ObjectId;

var serviceOffersSchema = {
  id: ObjectId,
  enabled: {type: Boolean, required: true, default: true},
  serviceName: {type: String, required: true, unique: true, index: true},
  serviceOffer: {type: String, required: true, unique: false},
  availableUntil: {type: Date, required: true, unique: false, index: true},
  registeredBy: {type: String, required: true, unique: false, index:true},
  isAliveCheck: {
    checkIsAlive: {type: Boolean, required: true, default: false},
    isAliveCheckURL: {type: String, required: false, default: ''},
    isAliveCheckInterval: {type: Number, required: false, default: 0}
  },
  created_at: {type: Date, default: Date.now, index: true},
  updated_at: {type: Date, default: Date.now, index: true}
};

var ServiceOffersSchema = new Schema(serviceOffersSchema);

// Date setter
ServiceOffersSchema.path('updated_at')
  .default(function(){
    return new Date();
  })
  .set(function(v) {
    return v == 'now' ? new Date() : v;
  });


module.exports = db.model('ServiceOffers', ServiceOffersSchema);
