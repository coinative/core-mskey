var MSKey = require('../');
var Key = require('core-key');
var HDKey = require('core-hdkey');

var hex = function (hex) { return new Buffer(hex, 'hex'); };

var standard = require('./fixtures/standard.json');
var hd = require('./fixtures/hd.json');

describe('MSKey', function () {
  describe('(invalid inputs)', function () {
    it('no options', function () {
      expect(function () { new MSKey() }).to.throw();
    });

    it ('no keys', function () {
      expect(function () { new MSKey({ m: 0 }) }).to.throw();
    });

    it ('too many keys (limit is 15 as per bip16)', function () {
      expect(function () { new MSKey({ m: 2, keys: new Array(16) }) }).to.throw();
    });

    it ('m 0', function () {
      expect(function () { new MSKey({ m: 0, keys: new Array(0) }) }).to.throw();
    });

    it ('m > pubkeys.length', function () {
      expect(function () { new MSKey({ m: 4, keys: new Array(3) }) }).to.throw();
    });
  });

  describe('derive/deriveHardened', function () {
    var sdkey = new Key({});

    it('should throw when not HD', function () {
      var key = new MSKey({ m: 1, keys: [sdkey, sdkey] });
      expect(function () { key.derive(0); }).to.throw();
    });

    describe('standard', function () {
      standard.forEach(function (fixture, i) {
        var keys = fixture.keys.map(function (key) {
          return new Key({ pub: hex(key) });
        });
        var key = new MSKey({ m: parseInt(fixture.m), keys: keys });

        it('should generate correct address #' + i, function () {
          expect(key.getAddress().toString()).to.equal(fixture.address);
        });
      });
    });

    describe('HD', function () {
      hd.forEach(function (fixture, i) {
        var keys = fixture.keys.map(function (key) {
          return new HDKey(key);
        });
        var key = new MSKey({ m: parseInt(fixture.m), keys: keys });

        Object.keys(fixture.addresses).forEach(function (path) {
          var derived = key;

          it('should generate correct address at ' + path, function () {
            path.split('/').forEach(function (index) {
              if (index === 'm') return;
              if (index.indexOf('H') > -1) {
                derived = derived.deriveHardened(parseInt(index.slice(0, -1)));
              } else {
                derived = derived.derive(parseInt(index));
              }
            });

            expect(derived.getAddress().toString()).to.equal(fixture.addresses[path]);
          });
        });
      });
    });
  });
});
