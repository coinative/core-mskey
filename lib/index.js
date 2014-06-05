var assert = require('assert');
var Address = require('core-address');
var Hash = require('core-hash');
var Script = require('core-script');

function MSKey(options) {
  assert(options, 'Missing options');
  assert(options.keys && options.keys.length > 0, 'Missing keys');
  assert(options.keys.length < 16, 'Too many keys');
  assert(options.m, 'Missing number of required signatures');
  assert(options.m <= options.keys.length, 'Number of required signatures cannot be higher than the number of keys');

  this.m = options.m;
  this.keys = options.keys;
  this.network = this.keys[0].network;
}

MSKey.prototype.getAddress = function () {
  var pubkeys = this.keys.map(function (key) { return key.pub; });
  var redeemScript = Script.createMultisigOutput(this.m, pubkeys);
  var hash = Hash.hash160(redeemScript.buffer);
  return new Address(hash, 'scripthash', this.network);
};

MSKey.prototype.derive = function (index) {
  var derived = this.keys.map(function (key) {
    return key.derive(index);
  });
  return new MSKey({ m: this.m, keys: derived });
};

MSKey.prototype.deriveHardened = function (index) {
  var derived = this.keys.map(function (key) {
    return key.deriveHardened(index);
  });
  return new MSKey({ m: this.m, keys: derived });
};

module.exports = MSKey;
