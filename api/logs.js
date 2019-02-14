const request = require('request');


class Logs {
	constructor() { }

	async getFights(raidId) {
		return new Promise((resolve, reject) => {
			let url = 'https://www.warcraftlogs.com:443/v1/report/fights/' + raidId + '?translate=false&api_key=' + process.env.APIKEY;
			request(url, (error, response, body) => {
				let data = JSON.parse(body);
				if (data.status === 401 || data.status === 400) return data.error;
				if (!error) {
					let bosses = {};

					data.fights.forEach(encounter => {
						if (encounter.boss != 0) {
							if (!bosses[encounter.boss]) {
								bosses[encounter.boss] = {
									name: encounter.name,
									wipes: 0,
									kills: 0,
									fightPercentage: 10000
								};
							}
							if (encounter.kill === true) {
								bosses[encounter.boss].kills++;
							}
							else {
								bosses[encounter.boss].wipes++;
								if (encounter.fightPercentage < bosses[encounter.boss].fightPercentage) {
									bosses[encounter.boss].fightPercentage = encounter.fightPercentage
								}
							}
						}
					});

					let fights = [];

					Object.keys(bosses).forEach(key => {
						if (bosses[key].kills >= 1) {
							fights += bosses[key].name + ' - Kills: ' + bosses[key].kills + '\n';
						}
						else {
							fights += bosses[key].name + ' - Wipes: ' + bosses[key].wipes + ' Best: ' + Math.round(bosses[key].fightPercentage / 100, 1) + '%\n';
						}
					});

					resolve(fights);
				}
				else {
					reject(error);
				}
			});
		});
	}

	async getLastRaid() {
		return new Promise((resolve, reject) => {
			let url = 'https://www.warcraftlogs.com:443/v1/reports/guild/Salvation/Argent-Dawn/EU?api_key=' + process.env.APIKEY;
			request(url, (error, response, body) => {
				if (!error) {
					let raidData = JSON.parse(body);
					resolve(raidData[0]);
				} else {
					reject(error);
				}
			});
		});
	}
}

module.exports = Logs;