/**
 * Returns connected Ethereum accounts.
 */
export async function connect() {
  if (typeof window.ethereum !== "undefined") {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    return accounts;
  } else {
    throw Error("Could not find ethereum in window.");
  }
}
