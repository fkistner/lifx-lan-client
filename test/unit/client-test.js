'use strict';

var Lifx = require('../../').Client;
var packet = require('../../').packet;
var assert = require('chai').assert;
var client = null;

suite('Client', () => {
  setup(() => {
    client = new Lifx();
  });

  teardown(() => {
    client.destroy();
  });

  test('not connected by default', () => {
    assert.isNull(client.address());
  });

  test('connected after init', (done) => {
    client.init({}, () => {
      assert.isObject(client.address());
      assert.property(client.address(), 'address');
      assert.property(client.address(), 'port');
      done();
    });
  });

  test('accepts init parameters', (done) => {
    client.init({
      address: '127.0.0.1',
      port: 57500,
      source: '12345678',
      debug: true
    }, () => {
      assert.equal(client.address().address, '127.0.0.1');
      assert.equal(client.address().port, 57500);
      assert.equal(client.source, '12345678');
      assert.isTrue(client.debug);
      done();
    });
  });

  test('inits with random source by default', (done) => {
    client.init({
      startDiscovery: false
    }, () => {
      assert.typeOf(client.source, 'string');
      assert.lengthOf(client.source, 8);
      done();
    });
  });

  test('discovery start and stop', (done) => {
    client.init({
      startDiscovery: false
    }, () => {
      assert.isNull(client.discoveryTimer);
      client.startDiscovery();
      assert.isObject(client.discoveryTimer);
      client.stopDiscovery();
      assert.isNull(client.discoveryTimer);
      done();
    });
  });

  test('finding bulbs by different parameters', () => {
    let bulbs = [{
        id: '0dd124d25597',
        address: '192.168.0.8',
        port: 56700,
        status: 'off'
      }, {
        id: 'ad227d95517z',
        address: '192.168.254.254',
        port: 56700,
        status: 'on'
      }, {
        id: '783rbc67cg14',
        address: '192.168.1.5',
        port: 56700,
        status: 'on'
      }, {
        id: '783rbc67cg14',
        address: 'FE80::903A:1C1A:E802:11E4',
        port: 56700,
        status: 'on'
    }];

    client.devices = bulbs;
    assert.deepEqual(client.lights(), bulbs);

    let result;
    result = client.light('0dd124d25597');
    assert.isObject(result);
    assert.equal(result.address, '192.168.0.8');

    result = client.light('FE80::903A:1C1A:E802:11E4');
    assert.isObject(result);
    assert.equal(result.id, '783rbc67cg14');

    result = client.light('192.168.254.254');
    assert.isObject(result);
    assert.equal(result.id, 'ad227d95517z');

    result = client.light('141svsdvsdv1');
    assert.isFalse(result);

    result = client.light('192.168.0.1');
    assert.isFalse(result);

    assert.throw(() => {
      client.light({id: '0123456789012'});
    }, TypeError);

    assert.throw(() => {
      client.light(['12a135r25t24']);
    }, TypeError);
  });

  test('package sending', (done) => {
    client.init({
      startDiscovery: false
    }, () => {
      assert.lengthOf(client.messagesQueue, 0, 'is empty');
      client.send(packet.create('getService', {}, '12345678'));
      assert.lengthOf(client.messagesQueue, 1);
      assert.property(client.messagesQueue[0], 'data');
      assert.notProperty(client.messagesQueue[0], 'address');
      done();
    });
  });
});
