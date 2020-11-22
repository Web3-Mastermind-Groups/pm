const { writeEnv, whitespace } = require("../utils/migrations");

const Registry = artifacts.require("Registry");
const Referenda = artifacts.require("Referenda");

module.exports = function(deployer, network, accounts) {
  const admin = accounts[0];
  deployer
  .then(async () => {
    return await Registry.deployed();
  })
  .then(async (registry) => {
    await deployer.deploy(Referenda, registry.address, {from: admin});
    return await Referenda.deployed();
  })
  .then(async (referenda) => {
    await writeEnv("REACT_APP_ETH_LOCAL_REFERENDA_ADDRESS", referenda.address);
    console.log(whitespace, "Name:", await referenda.name.call());
  });
};
