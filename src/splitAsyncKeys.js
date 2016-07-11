export default function splitAsyncKeys(stateDiff) {
  if (typeof stateDiff === 'function') {
    return {syncDiff: stateDiff, asyncDiff: {}};
  }

  let syncDiff = {};
  let asyncDiff = {};

  Object.keys(stateDiff).forEach((key) => {
    const value = stateDiff[key];

    if (
      value !== null &&
      typeof value === 'object' &&
      typeof value.then === 'function'
    ) {
      asyncDiff[key] = value;
    } else {
      syncDiff[key] = value;
    }
  });

  return {syncDiff, asyncDiff};
}
