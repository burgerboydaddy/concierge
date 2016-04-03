// Load modules
const account = require('./account');
const producer = require('./producer');

// API Server Endpoints
exports.endpoints = [

  // Accounts methods
  {method: "GET", path: "/account", config: account.getAccount},
  {method: "PUT", path: "/account", config: account.createAccount},
  {method: "PATCH", path: "/account", config: account.updateAccountSecret},

  // Service offers methods
  {method: "PUT", path: "/serviceOffer", config: producer.createServiceOffer},
  {method: "GET", path: "/serviceOffer", config: producer.getServiceOffers}
];
