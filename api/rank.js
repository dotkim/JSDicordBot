const request = require('request');
const format = require('util').format;

async function getRank() {
  return new Promise((resolve, reject) => {
    request('https://www.wowprogress.com/guild/eu/argent-dawn/Salvation/json_rank', function (error, response, body) {
      if (error) reject(error);

      body = JSON.parse(body)
      let message = format(
        '`Guild Ranking`\n`World Rank: %d`\n`Realm rank: %d`',
        body.world_rank,
        body.realm_rank
      );
      resolve(message);
    });
  });
}
module.exports = getRank;