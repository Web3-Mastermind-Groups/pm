const expect = require("chai").expect;
const web3 = require("web3");

const {
  ONE_ETH_IN_WEI,
  SECONDS_IN_WEEK,
  TimedEvm
} = require("../utils/test");
const {
  PM_ROLE
} = require("../utils/contracts");
const { generateVoteHash } = require("../utils/test");
const { catchRevert } = require("./exceptionsHelpers");

const Referenda = artifacts.require("Referenda");
const Registry = artifacts.require("Registry");

const toBN = web3.utils.toBN;

const VOTING_PERIOD_MINUTES = 5;

contract("Referenda", function (accounts) {
  const admin = accounts[0];
  const alex = accounts[1];
  const beth = accounts[2];
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  let referenda;
  let registry;

  describe("setStopped", function () {
    beforeEach(async function () {
      registry = await Registry.new();
      referenda = await Referenda.new(registry.address, toBN(VOTING_PERIOD_MINUTES));
      await registry.grantRole(PM_ROLE, alex);
    });

    it("should revert if msg.sender is not an admin", async function() {
      await catchRevert(referenda.setStopped.sendTransaction(true, { from: alex }));
    });
    it("should update the stopped property", async function() {
      await referenda.setStopped.sendTransaction(true, {from: admin});
      let stopped = await referenda.stopped.call();
      expect(stopped).to.be.true;
      await referenda.setStopped.sendTransaction(false, {from: admin});
      stopped = await referenda.stopped.call();
      expect(stopped).to.be.false;
    });
  });

  describe("createProposal", function () {
    beforeEach(async function () {
      registry = await Registry.new();
      referenda = await Referenda.new(registry.address, toBN(VOTING_PERIOD_MINUTES));
      await registry.grantRole(PM_ROLE, alex);
      const adminIsPM = await registry.hasPMRole.call(admin);
      expect(adminIsPM).to.be.false;
      const bethIsPM = await registry.hasPMRole.call(beth);
      expect(bethIsPM).to.be.false;
    });

    it("should revert if contract is stopped", async function() {
      await referenda.setStopped.sendTransaction(true, {from: admin});
      await catchRevert(createProposal(undefined, undefined, undefined, alex));
    });
    it("should revert if msg.sender is not a PM", async function() {
        await catchRevert(createProposal(undefined, undefined, undefined, admin));
        await catchRevert(createProposal(undefined, undefined, undefined, beth));
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
    it("should create a proposal that closes in `votingPeriodMinutes` minutes", async function () {
      const votingPeriodMinutes = await referenda.votingPeriodMinutes();
      await createProposal(undefined, undefined, undefined, alex);

      const proposal = await referenda.proposalWithId(1);
      expect(proposal.dateOpened.lt(proposal.dateClosed)).to.be.true;

      const expectedDiff = votingPeriodMinutes.mul(toBN(60));
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

  describe("removeProposal", function () {
    let proposalId;

    beforeEach(async function() {
      registry = await Registry.new();
      referenda = await Referenda.new(registry.address, toBN(VOTING_PERIOD_MINUTES));
      await registry.grantRole.sendTransaction(PM_ROLE, alex, { from: admin });
      await registry.grantRole.sendTransaction(PM_ROLE, beth, { from: admin });
      const tx = await createProposal(undefined, undefined, undefined, alex);
      const eventLog = tx.logs[0];
      proposalId = eventLog.args.id;
    });

    it("should revert if msg.sender is not an admin", async function() {
      await referenda.setStopped.sendTransaction(true, {from: admin});
      const stopped = await referenda.stopped.call();
      expect(stopped).to.be.true;
      await catchRevert(referenda.removeProposal.sendTransaction(proposalId, {from: alex}));
    });
    it("should revert if stopped is not true", async function() {
      await referenda.setStopped.sendTransaction(false, {from: admin});
      const stopped = await referenda.stopped.call();
      expect(stopped).to.be.false;
      await catchRevert(referenda.removeProposal.sendTransaction(proposalId), {from: admin});
    });
    it("should only remove the proposal with the given id", async function() {
      let proposal1 = await referenda.proposalWithId(proposalId);
      expect(proposal1.id.eq(toBN(1))).to.be.true;
      await createProposal(undefined, undefined, undefined, beth);
      await referenda.setStopped.sendTransaction(true, {from: admin});
      await referenda.removeProposal.sendTransaction(proposalId, {from: admin});
      proposal1 = await referenda.proposalWithId(proposalId);
      expect(proposal1.id.eq(toBN(0))).to.be.true;
      const proposal2 = await referenda.proposalWithId(2);
      expect(proposal2.id.eq(toBN(2))).to.be.true;
    });

  });

  describe("vote", function () {
    let evm;
    let proposalId;

    beforeEach(async function () {
      await beforeEachSetup(undefined);
    });

    async function beforeEachSetup(provider) {
      if (provider) {
        Registry.setProvider(provider);
        Referenda.setProvider(provider);
      }
      registry = await Registry.new();
      referenda = await Referenda.new(registry.address, toBN(VOTING_PERIOD_MINUTES));
      await registry.grantRole.sendTransaction(PM_ROLE, alex, { from: admin });
      await registry.grantRole.sendTransaction(PM_ROLE, beth, { from: admin });
      const tx = await createProposal(undefined, undefined, undefined, alex);
      const eventLog = tx.logs[0];
      proposalId = eventLog.args.id;
    }

    async function setupEvm(start = new Date()) {
      evm = new TimedEvm(start, accounts);
      await evm.setupAccounts();
      await evm.fundAccount(admin, toBN("1034439500000000000"));
      await evm.fundAccount(alex, toBN("10134439500000000000"));
      await evm.fundAccount(beth, toBN("10134439500000000000"));
    }

    it("should revert if contract is stopped", async function() {
      await referenda.setStopped.sendTransaction(true, {from: admin});
      const stopped = await referenda.stopped.call();
      expect(stopped).to.be.true;
      await catchRevert(vote(proposalId, undefined, undefined, alex));
    });
    it("should revert if caller is not PM", async function () {
      const from = admin;
      await catchRevert(vote(proposalId, undefined, undefined, from));
    });

    it("should revert if voting period is not open", async function () {
      await setupEvm();
      await beforeEachSetup(evm.provider);
      await evm.increaseTime(SECONDS_IN_WEEK * 4);
      await catchRevert(vote(proposalId, undefined, undefined, beth));
    });

    it("should revert if proposal does not exist", async function () {
      const from = alex;
      await catchRevert(vote(toBN(999), undefined, undefined, from));
    });

    it("should revert if vote hash is not valid", async function () {
      const from = alex;
      const voteHash = web3.utils.asciiToHex(0);
      await catchRevert(vote(proposalId, undefined, voteHash, from));
    });

    it("should allow PM to vote", async function () {
      const from = alex;
      const [tx, voteHash, nonces] = await vote(proposalId, undefined, undefined, from); // eslint-disable-line
      const proposalCount = await getProposalCount();
      const proposal = await referenda.proposalWithId.call(proposalCount);
      expect(proposal.voteCount == 1).to.be.true;
      const voterId = proposalCount;
      const retrievedVoter = await referenda.getProposalVoterById.call(proposalId, voterId);
      expect(retrievedVoter).to.equal(from);
      const retrievedVote = await referenda.getProposalVote.call(proposalId, from);
      expect(retrievedVote).to.equal(voteHash);
    });

    it("should emit an event when a vote is cast", async function() {
      const from = alex;
      const [tx, voteHash, nonces] = await vote(proposalId, undefined, undefined, from); // eslint-disable-line
      const eventLog = tx.logs[0];
      const loggedProposalId = eventLog.args.proposalId;
      const loggedVoter = eventLog.args.voter;
      const loggedVoteCount = eventLog.args.voteCount;
      expect(loggedProposalId.eq(toBN(proposalId))).to.be.true;
      expect(loggedVoter).to.equal(from);
      expect(loggedVoteCount.eq(toBN(1))).to.be.true;
    });

    it("should revert if voter has already voted", async function () {
      const from = alex;
      await vote(proposalId, undefined, undefined, from);
      const proposalCount = await getProposalCount();
      const proposal = await referenda.proposalWithId.call(proposalCount);
      expect(proposal.voteCount == 1).to.be.true;
      await catchRevert(vote(proposalId, undefined, undefined, from));
    });
  });

  async function createProposal(link, payoutAmount, payoutRecipient, from) {
    link = link || "ipfs://123";
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

  async function vote(proposalId, yes = 1, voteHash, from) {
    let nonces;
    if (!voteHash) {
      [voteHash, nonces] = await generateVoteHash(referenda, proposalId, from, yes);
    }
    const tx = await referenda.vote.sendTransaction(
      toBN(proposalId),
      voteHash,
      { from: from }
    );
    return [tx, voteHash, nonces];
  }
});

