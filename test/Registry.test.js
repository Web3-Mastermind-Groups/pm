const expect = require("chai").expect;

const Registry = artifacts.require("Registry");

const { PM_ROLE } = require("../utils/contracts");

contract("Registry", function (accounts) {
  const admin = accounts[0];
  const alex = accounts[1];
  const beth = accounts[2];
  const emptyAddress = "0x0000000000000000000000000000000000000000";

  let registry;

  describe("#hasPMRole()", function() {

    beforeEach(async function() {
      registry = await Registry.new();
    });

    it("should return true if the address is registered as a PM", async function() {
      await registry.grantRole(PM_ROLE, alex);
      const hasPMRole = await registry.hasPMRole.call(alex);
      expect(hasPMRole).to.be.true;
    });
  });
});
