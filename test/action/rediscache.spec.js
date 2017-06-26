import chai from 'chai';
import {
  expect
} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import action from '../../src/action/rediscache.js';

chai.config.includeStack = true;
chai.use(chaiAsPromised);
chai.should();

describe('RedisCache', () => {
  describe('with simple value', () => {

    it('should save the key value pairs correctly', (done) => {
      let params = {
        redis_host: "test",
        key: "foo",
        value: "bar"
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.deep.equal({
        key: params.key,
        value: params.value,
        context: null
      }).notify(done);
    });

    it('should read the key value pairs correctly', (done) => {
      let params = {
        redis_host: "test",
        key: "foo"
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.deep.equal({
        key: params.key,
        value: "bar",
        context: null
      }).notify(done);
    });

  });

  describe('with a complex value', () => {

    it('should save the complex value correctly', (done) => {
      let params = {
        redis_host: "test",
        key: "hm_foo",
        value: {
          "one": "1",
          "two": 2
        }
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.deep.equal({
        key: params.key,
        value: params.value,
        context: null
      }).notify(done);
    });

    it('should read the complex value correctly', (done) => {
      let params = {
        redis_host: "test",
        key: "hm_foo"
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.deep.equal({
        key: params.key,
        value: {
          "one": "1",
          "two": "2"
        },
        context:  null
      }).notify(done);
    });

    it('should read one field from a complex value correctly', (done) => {
      let params = {
        redis_host: "test",
        key: "hm_foo",
        fields: "one"
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.deep.equal({
        key: params.key,
        value: {
          "one": "1"
        },
        context: null
      }).notify(done);
    });

    it('should read multiple fields from a complex value correctly', (done) => {
      let params = {
        redis_host: "test",
        key: "hm_foo",
        fields: "two,three,one"
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.deep.equal({
        key: params.key,
        value: {
          "one": "1",
          "two": "2",
          "three": null
        },
        context: null
      }).notify(done);
    });

  });


  describe('(negative) with a missing value', () => {

    it('should return null', (done) => {
      let params = {
        redis_host: "test",
        key: "_missing_"
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.deep.equal({
        key: params.key,
        value: null,
        context: null
      }).notify(done);
    });

  });

  describe('(negative) with a missing required parameter', () => {

    it('like redis_host, should return null', (done) => {
      let params = {
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.be.rejectedWith("Parameter redis_host is required.").notify(done);
    });

    it('like key, should return null', (done) => {
      let params = {
        redis_host: "test"
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.be.rejectedWith("Parameter key is required.").notify(done);
    });

  });

});
