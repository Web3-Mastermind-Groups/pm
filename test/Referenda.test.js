const crypto = require("crypto");
const { create } = require("domain");
const expect = require("chai").expect;
const web3 = require("web3");

const { PM_ROLE, getUnixTimestamp } = require("./utils");

const Referenda = artifacts.require("Referenda");
const Registry = artifacts.require("Registry");

const BN = web3.utils.BN;
const toBN = web3.utils.toBN;

contract("Referenda", function (accounts) {
  const admin = accounts[0];
  const alex = accounts[1];
  const beth = accounts[2];
  const emptyAddress = "0x0000000000000000000000000000000000000000";

  let referenda;
  let registry;

  describe("createProposal", function () {

    beforeEach(async function () {
      registry = await Registry.new();
      referenda = await Referenda.new(registry.address);
      await registry.grantRole(PM_ROLE, alex);
    });

    it("should revert if msg.sender is not a PM", async function() {
      const adminIsPM = await registry.hasPMRole.call(admin);
      expect(adminIsPM).to.be.false;
      const bethIsPM = await registry.hasPMRole.call(beth);
      expect(bethIsPM).to.be.false;

      expect(async () => await createProposal(undefined, undefined, admin)).to.throw;
      expect(async () => await createProposal(undefined, undefined, beth)).to.throw;
    });
    it("should create a proposal with id equal to previous proposalCount + 1", async function () {
      const isPM = await registry.hasPMRole.call(alex);
      expect(isPM).to.be.true;

      const prevProposalCount = await referenda.proposalCount.call();
      await createProposal(undefined, undefined, alex);
      const nextProposalCount = await referenda.proposalCount.call();
      expect(prevProposalCount.add(toBN(1)).eq(nextProposalCount)).to.be.true;

      const proposal = await referenda.proposalWithId(nextProposalCount.toNumber());
      expect(proposal.id.eq(toBN(1))).to.be.true;
    });
    it("should create a proposal with status open", async function () {
      await createProposal(undefined, undefined, alex);
      const proposal = await referenda.proposalWithId(1);
      expect(proposal.id.eq(toBN(1))).to.be.true;
    });
    it("should create a proposal that closes in 3 weeks", async function () {
      const isPM = await registry.hasPMRole.call(alex);
      expect(isPM).to.be.true;

      const prevProposalCount = await referenda.proposalCount.call();
      await createProposal(undefined, undefined, alex);
      const nextProposalCount = await referenda.proposalCount.call();
      expect(prevProposalCount.add(toBN(1)).eq(nextProposalCount)).to.be.true;

      const proposal = await referenda.proposalWithId(nextProposalCount.toNumber());
      expect(proposal.id.eq(toBN(1))).to.be.true;
    });
    it("should emit a ProposalCreated event when a proposal is created", async function() {
      const tx = await createProposal(undefined, undefined, alex);
      const proposalCount = await getProposalCount();
      const eventLog = tx.logs[0];
      const eventEmitted = (eventLog.event == "ProposalCreated");
      expect(eventEmitted).to.be.true;

      const ID = 0;
      const PROPOSER = 1;
      const DATE_CLOSED = 2;
      expect(eventLog.args[ID].eq(proposalCount)).to.be.true;
      expect(eventLog.args[PROPOSER]).to.equal(alex);
      expect(eventLog.args[DATE_CLOSED].gt(toBN(getUnixTimestamp()))).to.be.true;
    });
  });

  async function createProposal(link, script, from) {
    link = link || crypto.randomBytes(32);
    script = script || crypto.randomBytes(32);
    return await referenda.createProposal.sendTransaction(link, script, { from: from });
  }

  async function getProposalCount() {
    return await referenda.proposalCount.call();
  }
});

