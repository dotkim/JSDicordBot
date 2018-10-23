const Discord = require('discord.js');
const dotenv = require('dotenv').config();
const request = require('request');
const format = require('util').format;

const client = new Discord.Client();

client.on('ready', () => {
	console.log('I am ready!');
});

function getFights(url, callback) {
	request(url, (error, response, body) => {
		body = JSON.parse(body)
		let fights = []
		for (i in body.fights) {
			let curFight = body.fights[i]
			if (curFight.kill != undefined && curFight.boss != 0) {
				if (curFight.kill === true) {
					fights += curFight.name + ' - Kill\n'
				}
				else {
					if (!fights.includes(curFight.name)) {
						fights += curFight.name + ' - Wipe\n'
					}
				}
			}
		}

		console.log(fights)
		return callback(fights)
	})
}

// Create an event listener for messages
client.on('message', message => {
	if (message.content.includes('!admin') === true) {
		if (message.author.id.includes(process.env.ADMIN) === true) {
			message.delete(); // Delete !admin request, 
			const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 20000 });
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
							request('https://www.warcraftlogs.com:443/v1/reports/guild/Salvation/Argent-Dawn/EU?start=1538156088557&api_key=' + process.env.APIKEY,
								(error, response, body) => {
									body = JSON.parse(body)
									url = 'https://www.warcraftlogs.com:443/v1/report/fights/' + body[0].id + '?translate=false&api_key=' + process.env.APIKEY
									let embed = new Discord.RichEmbed()
									getFights(url, (fights) => {
										embed
											.setTitle(format('**Logname: %s**', body[0].title))
											.setAuthor('Author: ' + body[0].owner)
											.setColor('RANDOM')
											.setURL('https://www.warcraftlogs.com/reports/' + body[0].id)
											.setDescription(
												format('Fights:\n%s', fights)
											);
										infoChannel = client.channels.get(process.env.INFOCHANNEL)
										templateChannel = client.channels.get(process.env.TEMPLATECHANNEL)
										templateChannel.fetchMessage(process.env.PROGRESSMESSAGEID)
											.then(message => {
												infoChannel.send(message.content + '\n', { embed })
													.then(/* store message ID for future edit of the sent message, this is to make the post as clean as possible. */)
													.catch(console.error)
											})
											.catch(console.error);
										message.delete();
										result.edit('Logs updated').then(msg => {msg.delete(10000)}).catch(console.error);
									})
								});
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