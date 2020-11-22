const { DEFAULT_ADMIN_ROLE, PM_ROLE } = require("../utils/contracts");
const { whitespace, writeEnv } = require("../utils/migrations");

const Registry = artifacts.require("Registry");

module.exports = function(deployer, network, accounts) {
  const admin = accounts[0];
  const primary = accounts[1];
  deployer
  .deploy(Registry, {from: admin})
  .then(async (contract) => {
    await writeEnv("REACT_APP_ETH_LOCAL_REGISTRY_ADDRESS", contract.address);

    console.log(whitespace, "Name:", await contract.name.call());
    console.log(whitespace, "DEFAULT_ADMIN_ROLE:", await contract.getRoleMember.call(DEFAULT_ADMIN_ROLE, 0));

    const response = await contract.grantRole(PM_ROLE, primary);
    const log = response.logs[0];
    if (log.event === "RoleGranted") {
      // console.log(whitespace, , log.args.account);
      console.log(whitespace, "Granted PM_ROLE to:", await contract.getRoleMember.call(PM_ROLE, 0));
    } else {
      throw Error("Unable to grant PM_ROLE");
    }

  });
};
