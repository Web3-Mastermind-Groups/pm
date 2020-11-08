const crypto = require("crypto");
const { create } = require("domain");
const expect = require("chai").expect;
const web3 = require("web3");

const {
  ONE_ETH_IN_WEI,
  PM_ROLE,
  SECONDS_IN_WEEK
} = require("./utils");

const Referenda = artifacts.require("Referenda");
const Registry = artifacts.require("Registry");

const toBN = web3.utils.toBN;

contract("Referenda", function (accounts) {
  const admin = accounts[0];
  const alex = accounts[1];
  const beth = accounts[2];
  const zeroAddress = "0x0000000000000000000000000000000000000000";

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

      expect(async () => await createProposal(undefined, undefined, undefined, admin)).to.throw;
      expect(async () => await createProposal(undefined, undefined, undefined, beth)).to.throw;
    });
    it("should create a proposal with id equal to previous proposalCount + 1", async function () {
      const isPM = await registry.hasPMRole.call(alex);
      expect(isPM).to.be.true;

      const prevProposalCount = await referenda.proposalCount.call();
      await createProposal(undefined, undefined, undefined, alex);
      const nextProposalCount = await referenda.proposalCount.call();
      expect(prevProposalCount.add(toBN(1)).eq(nextProposalCount)).to.be.true;

      const proposal = await referenda.proposalWithId(nextProposalCount.toNumber());
      expect(proposal.id.eq(toBN(1))).to.be.true;
    });
    it("should create a proposal with payout set", async function () {
      const payoutAmount = toBN(ONE_ETH_IN_WEI);
      const payoutRecipient = beth;
      await createProposal(undefined, payoutAmount, payoutRecipient, alex);
      const proposal = await referenda.proposalWithId(1);
      expect(proposal.payoutAmount.eq(payoutAmount)).to.be.true;
      expect(proposal.payoutRecipient).to.equal(beth);
    });
    it("should create a proposal with status open", async function () {
      await createProposal(undefined, undefined, undefined, alex);
      const proposal = await referenda.proposalWithId(1);
      expect(proposal.status.eq(toBN(0))).to.be.true;
    });
    it("should create a proposal that closes in 3 weeks", async function () {
      await createProposal(undefined, undefined, undefined, alex);

      const proposal = await referenda.proposalWithId(1);
      expect(proposal.dateOpened.lt(proposal.dateClosed)).to.be.true;

      const expectedDiff = toBN(SECONDS_IN_WEEK * 3);
      const actualDiff = proposal.dateClosed.sub(proposal.dateOpened);
      expect(actualDiff.eq(expectedDiff)).to.be.true;
    });
    it("should emit a ProposalCreated event when a proposal is created", async function() {
      const tx = await createProposal(undefined, undefined, undefined, alex);
      const proposalCount = await getProposalCount();
      const proposal = await referenda.proposalWithId.call(proposalCount);
      const eventLog = tx.logs[0];
      const eventEmitted = (eventLog.event == "ProposalCreated");
      expect(eventEmitted).to.be.true;
      expect(eventLog.args.id.eq(proposalCount)).to.be.true;
      expect(eventLog.args.proposer).to.equal(alex);
      expect(eventLog.args.dateClosed.eq(proposal.dateClosed)).to.be.true;
      expect(eventLog.args.payoutAmount.eq(toBN(0))).to.be.true;
      expect(eventLog.args.payoutRecipient).to.equal(zeroAddress);
    });
  });

  async function createProposal(link, payoutAmount, payoutRecipient, from) {
    link = link || crypto.randomBytes(32);
    payoutAmount = payoutAmount || 0;
    payoutRecipient = payoutRecipient || zeroAddress;
    return await referenda.createProposal.sendTransaction(
      link,
      payoutAmount,
      payoutRecipient,
      { from: from }
    );
  }

  async function getProposalCount() {
    return await referenda.proposalCount.call();
  }
});

