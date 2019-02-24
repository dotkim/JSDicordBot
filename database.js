const redis = require('redis');

class RedisDB {
  constructor() {
    this.options = {
      host: '10.0.0.30',
      port: '6379'
    }

    this.client = redis.createClient(this.options);

    this.client.on('error', (err) => {
      console.error(err);
    });
    
    this.client.on('ready', () => {
      console.log('Redis loaded...');
    });
  }

  setKey(key, value) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, function(err, reply) {
        if (err) reject(err);
        resolve(reply);
      });
    });
  }

  getKey(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, function(err, reply) {
        if (err) reject(err);
        resolve(reply);
      });
    });
  }

  delKey(key) {
    return this.client.del(key);
  }

}

module.exports = RedisDB;