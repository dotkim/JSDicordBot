const Discord = require('discord.js');
const dotenv = require('dotenv').config();
const request = require('request');
const format = require('util').format;

const client = new Discord.Client();

client.on('ready', () => {
	console.log('I am ready!');
});


function getFights(raidId) {
	return new Promise((resolve, reject) => {
		url = 'https://www.warcraftlogs.com:443/v1/report/fights/' + raidId + '?translate=false&api_key=' + process.env.APIKEY
		request(url, (error, response, body) => {
			if (!error) {
				data = JSON.parse(body)
				let bosses = {}
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
				fights = []
				Object.keys(bosses).forEach(key => {
					if (bosses[key].kills >= 1) {
						fights += bosses[key].name + ' - Kills: ' + bosses[key].kills + '\n'
					}
					else {
						fights += bosses[key].name + ' - Wipes: ' + bosses[key].wipes + ' Best: ' + Math.round(bosses[key].fightPercentage/100, 1) + '%\n'
					}
				})
				resolve(fights)
			}
			else {
				reject(error)
			}
		})
	})
}

let getLastRaid = new Promise((resolve, reject) => {
	request('https://www.warcraftlogs.com:443/v1/reports/guild/Salvation/Argent-Dawn/EU?start=1538156088557&api_key=' + process.env.APIKEY, (error, response, body) => {
		if (!error) {
			let raidData = JSON.parse(body)
			resolve(raidData[0])
		} else {
			reject(error)
		}
	})
})

//Global var for testing.
//This is waiting for a DB implementation.
let logMessageID = "504405057668644876"

// Create an event listener for messages
client.on('message', message => {
	if (message.content.includes('!admin') === true) {
		if (message.author.id.includes(process.env.ADMIN) === true) {
			message.delete(); // Delete !admin request, 
			const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 20000, maxMatches: 2 });
			message.reply('Waiting for command')
				.then(result => {
					collector.on('collect', message => {
						if (message.content == 'rank') {
							message.delete();
							request('https://www.wowprogress.com/guild/eu/argent-dawn/Salvation/json_rank', function (error, response, body) {
								body = JSON.parse(body)
								result.edit(
									format('__**Guild Ranking**__\n**Score:**\t\t\t\t__%d__\n**World Rank:**\t__%d__\n**Realm rank:**\t __%d__',
										body.score,
										body.world_rank,
										body.realm_rank)
								);
							});
						}
						if (message.content == 'logs') {
							getLastRaid.then(raidData => {
								getFights(raidData.id).then(fights => {
									let embed = new Discord.RichEmbed()
										.setTitle(format('**Logname: %s**', raidData.title))
										.setAuthor(message.author.username, message.author.avatarURL)
										.setColor('RANDOM')
										.setURL('https://www.warcraftlogs.com/reports/' + raidData.id)
										.setDescription(
											format('Fights:\n%s', fights)
										);
									infoChannel = client.channels.get(process.env.INFOCHANNEL)
									templateChannel = client.channels.get(process.env.TEMPLATECHANNEL)
									templateChannel.fetchMessage(process.env.PROGRESSMESSAGEID)
										.then(message => {
											if (!logMessageID) {
												infoChannel.send(message.content + '\n', { embed })
												.then(msg => {
													//Save msg ID somewhere.
												})
											}
											else {
												infoChannel.fetchMessage(logMessageID)
												.then(infoMsg => {
													infoMsg.edit(message.content + '\n', { embed })
												})
											}
										})
										.catch(console.error);
									message.delete();
									result.edit('Logs updated').then(msg => { msg.delete(10000) }).catch(console.error);
								})
									.catch(console.error)
							})
								.catch(console.error)
						}
					})
				})
				.catch(console.error)
		}
		else {
			message.channel.send('Nay')
		}
	}
	// If the message is "ping"
	if (message.content === 'ping') {
		// Send "pong" to the same channel
		message.channel.send('pong');
	}
	if (message.content === 'what is my avatar') {
		// Send the user's avatar URL
		message.reply(message.author.avatarURL);
	}
	if (message.content === 'show ava') {
		message.channel.send(client.user.displayAvatarURL)
	}
});

client.login(process.env.TOKEN)