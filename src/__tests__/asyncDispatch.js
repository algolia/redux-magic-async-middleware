import {expect} from 'chai';
import updeep from 'updeep';
import deferred from 'promise-defer';

import asyncDispatch from '../asyncDispatch';
import {isPending, isReady} from 'eventual-values';

describe('modux/asyncDispatch', () => {
  var dispatch;
  const type = 'NAME_SPACE/COMMIT';
  const key = 'test';
  var promise = new Promise(() => {});

  beforeEach(() => {
    dispatch = sinon.spy();
  });

  it('should return the loading action', () => {
    var actual = asyncDispatch(dispatch, type, key, promise);

    expect(actual.type).to.eql('NAME_SPACE/COMMIT');
    expect(actual.payload.test).to.be.a('function');
    expect(isPending(updeep(actual.payload, {}).test)).to.eq(true);
    expect(isPending(updeep(actual.payload, {test: 'value'}).test)).to.eq(false);
  });

  context('when overrideStatus is set to true', () => {
    it('should return the loading action', () => {
      var actual = asyncDispatch(dispatch, type, key, promise, true);

      expect(actual.type).to.eql('NAME_SPACE/COMMIT');
      expect(isPending(updeep(actual.payload, {}).test)).to.eq(true);
      expect(isPending(updeep(actual.payload, {test: 'value'}).test)).to.eq(true);
    });
  });

  context('when the promise is resolved', () => {
    it('should dispatch the success action', () => {
      const def = deferred();

      asyncDispatch(dispatch, type, key, def.promise);

      def.resolve({name: 'test'});

      return def.promise.then(() => {
        expect(dispatch.args[0][0]).to.eql({
          type: 'NAME_SPACE/COMMIT_SUCCESS',
          payload: {
            [key]: {name: 'test'}
          }
        });

        expect(isReady(dispatch.args[0][0])).to.eql(true);
      });
    });
  });
});
