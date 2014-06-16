var Address = require('satoshi-address');
var Hash = require('satoshi-hash');
var Script = require('satoshi-script');

function MSKey(options) {
  if (!options) {
    throw new Error('Missing options');
  }
  if (!options.keys || options.keys.length === 0) {
    throw new Error('Missing keys');
  }
  if (options.keys.length >= 16) {
    throw new Error('Too many keys');
  }
  if (typeof options.m !== 'number') {
    throw new Error('Missing number of required signatures');
  }
  if (options.m < 0 || options.m > options.keys.length) {
    throw new Error('Invalid number of required signatures');
  }

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
