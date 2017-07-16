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
        value: "bar",
        context: "c"
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.deep.equal({
        key: params.key,
        value: params.value,
        context: "c"
      }).notify(done);
    });

    it('should read the key value pairs correctly', (done) => {
      let params = {
        redis_host: "test",
        key: "foo",
        context: "ccc"
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.deep.equal({
        key: params.key,
        value: "bar",
        context: "ccc"
      }).notify(done);
    });

  });

  describe('with boolean value', () => {

    it('should save the key value pairs correctly', (done) => {
      let params = {
        redis_host: "test",
        key: "foo_boolean",
        value: true,
        context: "c"
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.deep.equal({
        key: params.key,
        value: params.value,
        context: "c"
      }).notify(done);
    });

    it('should read the key value pairs correctly', (done) => {
      let params = {
        redis_host: "test",
        key: "foo_boolean",
        context: "ccc"
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.deep.equal({
        key: params.key,
        value: "true",
        context: "ccc"
      }).notify(done);
    });

  });


  describe('with multiple items', () => {

    it('should save ALL key value pairs correctly', (done) => {
      let params = {
        redis_host: "test",
        items: [{
            key: "key-1",
            value: "value-1"
          },
          {
            key: "key-2",
            value: "value-2"
          }
        ]
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      console.log("Invoking action with params:" + JSON.stringify(params));

      let result = action(params);
      result.should.eventually.deep.equal({
        items: [{
            key: params.items[0].key,
            value: params.items[0].value
          },
          {
            key: params.items[1].key,
            value: params.items[1].value
          }
        ],
      }).notify(done);
    });

    it('should read ALL key value pairs correctly', (done) => {
      let params = {
        redis_host: "test",
        items: [{
            key: "key-1",
            value: "value-1"
          },
          {
            key: "key-2",
            value: "value-2"
          }
        ],
        context: "ccc"
      };
      process.env.__OW_API_KEY = "test";
      process.env.__redis_client = "fakeredis";

      let result = action(params);
      result.should.eventually.deep.equal({
        items: [{
            key: params.items[0].key,
            value: params.items[0].value
          },
          {
            key: params.items[1].key,
            value: params.items[1].value
          }
        ],
        context: "ccc"
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
        }
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
        }
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
        value: null
      }).notify(done);
    });

  });

  describe('(negative) with a missing required parameter', () => {

    it('like redis_host, should return null', (done) => {
      let params = {};
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
