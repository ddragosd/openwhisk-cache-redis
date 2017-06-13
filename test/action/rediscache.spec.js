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
    describe('with a Redis instance', () => {

        it('should set the key value pairs correctly', (done) => {
            let params = {
                redis_host: "test",
                key: "foo",
                value: "bar"
            };
            process.env.__OW_API_KEY = "test";
            process.env.__redis_client = "redis-mock";

            // The action returns a Promise and we can use "eventually" to wait for it.
            // If the action doesn't return a Promise we can remove "eventually"
            //   and write instead "should.deep.equal"
            let result = action(params);
            result.should.eventually.deep.equal({
                key: params.key,
                value: params.value
            }).notify(done);
        });

        it('should get the key value pairs correctly', (done) => {
            let params = {
                redis_host: "test",
                key: "foo"
            };
            process.env.__OW_API_KEY = "test";
            process.env.__redis_client = "redis-mock";

            // The action returns a Promise and we can use "eventually" to wait for it.
            // If the action doesn't return a Promise we can remove "eventually"
            //   and write instead "should.deep.equal"
            let result = action(params);
            result.should.eventually.deep.equal({
                key: params.key,
                value: "bar"
            }).notify(done);
        });

      });
    });
