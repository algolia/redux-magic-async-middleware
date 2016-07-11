var chai = require('chai');
global.sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
