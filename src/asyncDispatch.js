import eventual from 'eventual-values';
import updeep from 'updeep';

function isNotReadyOrUndefined(value) {
  return value === undefined || !eventual.isReady(value);
}

function makeAction(type, key, path, status, overrideStatus, payload = null) {
  const action = {
    type: status === 'pending' ? type : `${type}_${status.toUpperCase()}`
  };

  switch (status) {
    case 'success':
      action.payload = {
        [key]: eventual.resolve(payload)
      };
      break;
    case 'error':
      action.payload = {
        [key]: eventual.reject(payload)
      };

      break;
    default:
      action.payload = {
        [key]: overrideStatus ?
          eventual() :
          updeep.ifElse(isNotReadyOrUndefined, eventual, eventual.resolve)
      };

      break;
  }

  if (path !== null) {
    action.path = path;
  }

  return action;
}

export default function asyncDispatch(
  dispatch,
  type,
  key,
  promise,
  overrideStatus = false,
  path = null
) {
  promise.then((data) => {
    dispatch(makeAction(type, key, path, 'success', overrideStatus, data));
  }).catch((error) => {
    dispatch(makeAction(type, key, path, 'error', overrideStatus, error));
  });

  return makeAction(type, key, path, 'pending', overrideStatus);
}
