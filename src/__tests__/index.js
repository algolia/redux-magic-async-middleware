import {expect} from 'chai';
import deferred from 'promise-defer';
import omit from 'lodash/omit';
import updeep from 'updeep';

import middleware from '../';
import {isPending} from 'eventual-values';


describe('modux/magicAsyncMiddleware', () => {
  var store;
  var next;
  var partialMiddleware;

  before(() => {
    store = {
      dispatch: sinon.spy(),
      getState: sinon.spy()
    };

    next = sinon.spy();

    partialMiddleware = middleware(store)(next);
  });

  describe('when dispatching a non-COMMIT action', () => {
    it('should just call next on the action', () => {
      const action = {
        type: 'NAME_SPACE/UNKNOWN',
        payload: {
          test: 'true'
        }
      };

      partialMiddleware(action);

      expect(next).to.have.been.calledWithExactly(action);
    });
  });

  describe('when dispatching a COMMIT action', () => {
    const type = 'NAME_SPACE/COMMIT';
    describe('when there are only sync payload keys', () => {
      it('should just call next on the action', () => {
        const action = {
          type,
          payload: {
            test: 'true',
            test2: ['test3']
          }
        };

        partialMiddleware(action);

        expect(next).to.have.been.calledWithExactly(action);
      });
    });

    describe('when there are async payload keys', () => {
      var def1;
      var def2;

      before(() => {
        def1 = deferred();
        def2 = deferred();
      });

      it('should call next with the async keys action', () => {
        const action = {
          type,
          path: 'path',
          payload: {
            test: 'true',
            test2: ['test3'],
            async1: def1.promise,
            async2: def2.promise
          }
        };

        partialMiddleware(action);

        const args = next.args[2][0];

        expect(args.type).to.eql('NAME_SPACE/COMMIT');
        expect(args.path).to.eql('path');
        expect(omit(args.payload, 'async1', 'async2')).to.eql({
          test: 'true',
          test2: ['test3']
        });

        expect(isPending(updeep(args.payload, {}).async1)).to.eq(true);
        expect(isPending(updeep(args.payload, {}).async2)).to.eq(true);
      });

      it('should call next on the async key when they resolve', () => {
        def1.resolve({newValue: 'true'});

        return def1.promise.then(() => {
          expect(store.dispatch).to.have.been.calledWithExactly({
            type: `${type}_SUCCESS`,
            path: 'path',
            payload: {
              async1: {newValue: 'true'}
            }
          });
        });
      });

      it('should call next on the async key when they are rejected', () => {
        def2.reject('error message');

        return def1.promise.catch(() => {
          expect(store.dispatch).to.have.been.calledWithExactly({
            type: `${type}_ERROR`,
            error: 'error message',
            path: 'path',
            payload: {
              async2Status: 'error'
            }
          });
        });
      });
    });
  });
});
