/**
 * Db schemas for accounts
 * version: 0.1
 */
'use strict';

const Schema = db.Schema;
const ObjectId = Schema.ObjectId;

var accountSchema = {
  id: ObjectId,
  enabled: {type: Boolean, required: true, default: true},
  accountKey: {type: String, required: true, unique: true, index: true},
  accountName: {type: String, required: true, unique: false, index: true},
  accountSecret: {type: String, required: false, unique: false, index: false},
  created_at: {type: Date, default: Date.now, index: true},
  updated_at: {type: Date, default: Date.now, index: true}
};

var AccountSchema = new Schema(accountSchema);

AccountSchema.path('updated_at')
  .default(function(){
    return new Date();
  })
  .set(function(v) {
    return v == 'now' ? new Date() : v;
  });


module.exports = db.model('Accounts', AccountSchema);
