/**
 * Returns UNIX timestamp of given date.
 * @param {string} date Date to start from as YYYY/MM/DD, timestamp or now
 */
export function getUnixTimestamp(date = "now") {
  let ms = 0;
  if (date === "now") {
    ms = Date.now();
  } else {
    ms = new Date(date).getTime();
  }
  return Math.floor(ms / 1000);
}
