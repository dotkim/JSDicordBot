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
				body = JSON.parse(body)
				let bosses = {}
				let fights = []
				for (i in body.fights) {
					let curFight = body.fights[i]
					if (curFight.kill != undefined && curFight.boss != 0) {
						let bKill = 0
						let bWipe = 0

						// This function might be move to a object as seen below.
						//the second for loop can be removed and the returned values can be moved outside of the first for loop
						/* if (!bosses[curFight.boss]) {
							bosses[curFight.boss] = {
								name: curFight.name,
								wipes: 0,
								kills: 0
							};
						}
						if(curFight.kill === true){
							bosses[curFight.boss].kills++;
						}
						else {
							bosses[curFight.boss].wipes++;	
						} */

						for (f in body.fights) {
							let encounterCheck = body.fights[f]
							if (encounterCheck.boss == curFight.boss) {
								if (encounterCheck.kill === true) {
									bKill += 1
								}
								else {
									bWipe += 1
								}
							}
						}
						if ((curFight.kill === true) && (!fights.includes(curFight.name))) {
							if (bKill > 1) {
								fights += curFight.name + ' - Kill(' + bKill + ')\n'
							}
							else {
								fights += curFight.name + ' - Kill\n'
							}
						}
						else if ((curFight.kill !== true) && (!fights.includes(curFight.name))) {
							if (bWipe > 1) {
								fights += curFight.name + ' - Wipe(' + bWipe + ')\n'
							}
							else {
								fights += curFight.name + ' - Wipe\n'
							}
						}
					}
				}
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
											infoChannel.send(message.content + '\n', { embed })
												.then( /* store message ID for future edit of the sent message, this is to make the post as clean as possible. */)
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