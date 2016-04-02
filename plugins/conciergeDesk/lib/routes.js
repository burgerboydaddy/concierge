// Load modules

const consumer = require('./consumer');
const account = require('./account');

// API Server Endpoints
exports.endpoints = [
  // Consumer methods
  {method: "GET", path: "/consumer", config: consumer.getConsumer},
  // ,{method: "PUT", path: "/consumer", config: consumer.createConsumer}

  // Accounts methods
  {method: "GET", path: "/account", config: account.getAccount},
  {method: "PUT", path: "/account", config: account.createAccount}
];
