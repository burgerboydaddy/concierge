const async = require('async');
const MongoClient = require('mongodb').MongoClient;

const adminAccounts = [
  { enabled: true, accountKey: 'firstAdmin', accountSecret: 'SOMERANDOMSECRET', accountName:'CONCIERGE', created_at: new Date(), updated_at: new Date()}
];
var dbConn;

function createAdminAccounts(admin, done) {
  dbConn.collection('accounts').findAndModify(
    { accountKey: admin.accountKey},  // query
    [['_id','asc']],  // sort order
    { $setOnInsert: admin}, // update or insert if does not exist
    {
      new: true,   // return new doc if one is upserted
      upsert: true // insert the document if it does not exist
    },
    function(err, object) {
      if (err){
        console.warn(err.message);  // returns error if no matching object found
      }
      done();
    });
}

exports = module.exports = function(done) {
  MongoClient.connect(global.mongo, function (err, database) {
    if(err) {
      throw err;
    }
    dbConn = database;
    async.forEach(adminAccounts, createAdminAccounts, done);
  });
};

