import {expect} from 'chai';
import pick from 'lodash/pick';
import omit from 'lodash/omit';

import splitAsyncKeys from '../splitAsyncKeys';

describe('modux/splitAsyncKeys', () => {
  it('should properly bucket keys', () => {
    var data = {
      asyncKey: new Promise(() => {}),
      syncKey1: 'test',
      syncKey2: ['test2', 'test3'],
      nullKey: null
    };

    var {syncDiff, asyncDiff} = splitAsyncKeys(data);

    expect(asyncDiff).to.eql(pick(data, 'asyncKey'));
    expect(syncDiff).to.eql(omit(data, 'asyncKey'));
  });
});
