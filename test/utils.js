const web3 = require("web3");

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
  PM_ROLE,
  getUnixTimestamp
};
