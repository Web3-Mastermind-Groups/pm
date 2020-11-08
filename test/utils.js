const web3 = require("web3");

const ONE_ETH_IN_WEI = "1000000000000000000";

const SECONDS_IN_WEEK = 604800;

const PM_ROLE = web3.utils.keccak256("PM_ROLE");
/**
 * Returns UNIX timestamp of given date.
 * @param date Date to start from as YYYY/MM/DD, timestamp or now
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
  PM_ROLE,
  getUnixTimestamp
};
