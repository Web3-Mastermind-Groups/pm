const fs = require("fs").promises;
const process = require("process");

const ENV_PATH = `${process.env.NODE_PATH}/.env`;

const whitespace = "    ";

async function initializeEnv() {
  await fs.writeFile(ENV_PATH, "", {flag: "w"});
}

async function writeEnv(key, value) {
  const message = `\n${key}=${value}`;
  await fs.writeFile(ENV_PATH, message, {flag: "a"});
}

module.exports = {
  initializeEnv,
  writeEnv,
  whitespace
};
