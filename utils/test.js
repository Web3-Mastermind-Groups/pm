const Ganache = require("ganache-core");
const Web3 = require("web3");

const util = require("util");

const ONE_ETH_IN_WEI = "1000000000000000000";

const SECONDS_IN_WEEK = 604800;

const toBN = Web3.utils.toBN;

class TimedWeb3 {
  /**
   * Creates web3 instance with provider that starts minin from specified time
   * @param {Date} start Date to start first block from. Defaults to now.
   * @param {Array<string>} accounts Accounts to unlock in provider
   */
  constructor(start = new Date(), accounts = []) {
    this.providedAccounts = accounts;
    this.provider = Ganache.provider({
      default_balance_ether: toBN("134439500000000000"),
      time: start,
      unlocked_accounts: this.providedAccounts
    });
    this.web3 = new Web3(this.provider);
  }

  /**
   * Sets primary account as web3 default and returns accounts
   */
  async setupAccounts() {
    const response = await this.send("eth_accounts");
    const accounts = response.result;
    this.primaryAccount = accounts[0];
    this.web3.eth.defaultAccount = this.primaryAccount;
    return accounts;
  }

  /**
   * Sends `amount` from primary account to `account`
   * @param {string} account Account to fund
   * @param {BigNumber} amount Amount to send
   */
  async fundAccount(account, amount) {
    await this.web3.eth.sendTransaction({
      from: this.primaryAccount,
      to: account,
      value: amount
    });
  }

  /**
   * Mines a new block with timestamp at current timestamp + `secondsToJump`
   * @param {number} secondsToJump Seconds to increase block timestamp
   */
  async increaseTime(secondsToJump) {
    const err = 0;
    let out = await this.send("evm_increaseTime", [secondsToJump]);
    if (out[err]) throw out[err];
    // Mine a block so new time is recorded.
    out = await this.send("evm_mine");
    if (out[err]) throw out[err];
  }

  /**
   *
   * @param {string} method RPC method to call
   * @param {Array} params List of arguments for the RPC method
   * @param {} callback
   */
  async send(method, params) {
    const sendAsync = util.promisify(this.provider.sendAsync);
    return await sendAsync({
      jsonrpc: "2.0",
      method: method,
      params: params || [],
      id: new Date().getTime()
    });
  }
}

/**
 * Returns UNIX timestamp of given date.
 * @param {string} date Date to start from as YYYY/MM/DD, timestamp or now
 */
function getUnixTimestamp(date = "now") {
  let ms = 0;
  if (date === "now") {
    ms = Date.now();
  } else {
    ms = new Date(date).getTime();
  }
  return Math.floor(ms / 1000);
}

module.exports = {
  ONE_ETH_IN_WEI,
  SECONDS_IN_WEEK,
  TimedWeb3,
  getUnixTimestamp
};
