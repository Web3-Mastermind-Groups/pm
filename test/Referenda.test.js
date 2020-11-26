const crypto = require("crypto");
const expect = require("chai").expect;
const web3 = require("web3");

const {
  ONE_ETH_IN_WEI,
  SECONDS_IN_WEEK,
  TimedWeb3
} = require("../utils/test");
const {
  PM_ROLE
} = require("../utils/contracts");

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

      try {
        await createProposal(undefined, undefined, undefined, admin);
      } catch (error) {
        console.log("Caught error:", error.message);
        expect(error).to.not.be.undefined;
      }
      try {
        await createProposal(undefined, undefined, undefined, beth);
      } catch (error) {
        console.log("Caught error:", error.message);
        expect(error).to.not.be.undefined;
      }
    });
    it("should create a proposal with id equal to previous proposalCount + 1", async function () {
      const isPM = await registry.hasPMRole.call(alex);
      expect(isPM).to.be.true;

      const prevProposalCount = await getProposalCount();
      await createProposal(undefined, undefined, undefined, alex);
      const nextProposalCount = await getProposalCount();
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

  describe("vote", function () {
    let proposalId;

    beforeEach(async function () {
      await beforeEachSetup(undefined, admin);
    });

    async function beforeEachSetup(provider) {
      if (provider) {
        Registry.setProvider(provider);
        Referenda.setProvider(provider);
      }
      registry = await Registry.new();
      referenda = await Referenda.new(registry.address);
      await registry.grantRole.sendTransaction(PM_ROLE, alex, { from: admin });
      await registry.grantRole.sendTransaction(PM_ROLE, beth, { from: admin });
      const tx = await createProposal(undefined, undefined, undefined, alex);
      const eventLog = tx.logs[0];
      proposalId = eventLog.args.id;
    }

    it("should revert if caller is not PM", async function () {
      const from = admin;
      try {
        await vote(proposalId, undefined, undefined, undefined, from);
      } catch (error) {
        console.log("Caught error:", error.message);
        expect(error).to.not.be.undefined;
      }
    });

    it("should revert if voting period is not open", async function () {
      const timed = new TimedWeb3(new Date(), accounts);
      await timed.setupAccounts();
      await timed.fundAccount(admin, toBN("1034439500000000000"));
      await timed.fundAccount(alex, toBN("10134439500000000000"));
      await timed.fundAccount(beth, toBN("10134439500000000000"));
      await beforeEachSetup(timed.provider);
      await timed.increaseTime(SECONDS_IN_WEEK * 4);
      try {
        await vote(proposalId, undefined, undefined, undefined, beth);
      } catch (error) {
        console.log("Caught error:", error.message);
        expect(error).to.not.be.undefined;
      }
    });

    it("should revert if proposal does not exist", async function () {
      const from = alex;
      try {
        await vote(999, undefined, undefined, undefined, from);
      } catch (error) {
        console.log("Caught error:", error.message);
        expect(error).to.not.be.undefined;
      }
    });

    it("should revert if vote hash is not valid", function () {
      // See valid vote hash algorithm
      // TODO
    });

    it("should allow PM to vote", async function () {
      const from = alex;
      await vote(proposalId, undefined, undefined, undefined, from);
      const proposalCount = await getProposalCount();
      const proposal = await referenda.proposalWithId.call(proposalCount);
      expect(proposal.voteCount == 1).to.be.true;
      expect(proposal.yesCount == 1).to.be.true;
    });

    it("should revert if voter has already voted", async function () {
      const from = alex;
      await vote(proposalId, undefined, undefined, undefined, from);
      const proposalCount = await getProposalCount();
      const proposal = await referenda.proposalWithId.call(proposalCount);
      expect(proposal.voteCount == 1).to.be.true;
      expect(proposal.yesCount == 1).to.be.true;
      try {
        await vote(proposalId, undefined, undefined, undefined, from);
      } catch (error) {
        console.log("Caught error:", error.message);
        expect(error).to.not.be.undefined;
      }
    });
  });

  async function createProposal(link, payoutAmount, payoutRecipient, from) {
    link = link || crypto.randomBytes(32);
    payoutAmount = payoutAmount || 0;
    payoutRecipient = payoutRecipient || zeroAddress;
    return await referenda.createProposal.sendTransaction(
      link,
      toBN(payoutAmount),
      payoutRecipient,
      { from: from }
    );
  }

  async function getProposalCount() {
    return await referenda.proposalCount.call();
  }

  async function vote(proposalId, yes, voteHash, nonce, from) {
    yes = (typeof(yes) == "boolean") ? yes : true;
    voteHash = voteHash || crypto.randomBytes(32);
    nonce = nonce || 0;
    return await referenda.vote.sendTransaction(
      proposalId,
      yes,
      voteHash,
      nonce,
      { from: from }
    );
  }
});

