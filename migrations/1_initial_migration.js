const Migrations = artifacts.require("Migrations");
const { initializeEnv } = require("../utils/migrations");

module.exports = function (deployer) {
  deployer.deploy(Migrations).then(async () => {
    await initializeEnv();
  });
};
