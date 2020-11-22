const web3 = require("web3");

const DEFAULT_ADMIN_ROLE = "0x00";
const PM_ROLE = web3.utils.keccak256("PM_ROLE");

module.exports = {
  DEFAULT_ADMIN_ROLE,
  PM_ROLE
};
