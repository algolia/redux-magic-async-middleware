import splitAsyncKeys from './splitAsyncKeys';
import asyncDispatch from './asyncDispatch';

export default function magicAsyncMiddleware(store) {
  return next => action => {
    if (
      action.payload &&
      typeof action.payload === 'object' &&
      action.payload.promise === undefined &&
      action.payload.length === undefined
    ) {
      const {syncDiff, asyncDiff} = splitAsyncKeys(action.payload);

      if (Object.keys(asyncDiff).length > 0) {
        const asyncAction = Object.keys(asyncDiff).reduce((memo, key) => {
          const promise = asyncDiff[key];

          const values = asyncDispatch(
            store.dispatch,
            action.type,
            key,
            promise,
            action.overrideStatus,
            action.path
          );

          return {
            ...memo,
            payload: {
              ...memo.payload,
              ...values.payload
            }
          };
        }, {
          type: action.type,
          path: action.path,
          payload: syncDiff
        });

        next(asyncAction);
      } else {
        next(action);
      }
    } else {
      next(action);
    }
  };
}
