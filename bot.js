const Discord = require('discord.js');
const dotenv = require('dotenv').config();
const request = require('request');
const format = require('util').format;

const client = new Discord.Client();

client.on('ready', () => {
	console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
	if (message.content.includes('!admin') === true) {
		if (message.author.id.includes(process.env.ADMIN) === true) {
			message.delete();
			const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 20000 });
			message.reply('Waiting for command')
				.then(result => {
					collector.on('collect', message => {
						if (message.content == 'rank') {
							message.delete();
							request('https://www.wowprogress.com/guild/eu/argent-dawn/Salvation/json_rank', function (error, response, body) {
								body = JSON.parse(body)
								result.edit(format('__**Guild Ranking**__\n**Score:** __%d__\n**World Rank:** __%d__\n**Realm rank:** __%d__', body.score, body.world_rank, body.realm_rank));
							});
						}
						if (message.content == 'logs') {
							request('https://www.warcraftlogs.com:443/v1/reports/guild/Salvation/Argent-Dawn/EU?start=1538156088557&api_key=' + process.env.APIKEY, (error, response, body) => {
								body = JSON.parse(body)
								let embed = new Discord.RichEmbed()
									.setTitle(format('**Logname: %s**', body[0].title))
									.setAuthor(message.author.username, message.author.avatarURL)
									.setColor('RANDOM')
									.setURL('https://www.warcraftlogs.com/reports/' + body[0].id)
									.setDescription(
										request('https://www.warcraftlogs.com:443/v1/report/fights/' + body[0].id + '?translate=false&api_key=' + process.env.APIKEY, (error, response, body) => {
											body = JSON.parse(body)
											let bosses = ""
											let i;
											for (i in body.fights) {
												let curFight = body.fights[i]
												if (curFight.kill != undefined && curFight.boss != 0) {
													bosses += format('**Fight name:** %s', curFight.name)
													/* console.log(curFight.name)
													console.log(curFight.kill)
													console.log(curFight.difficulty) */
												}
											return bosses
											}
										})
									);
								result.edit({ embed });
								message.delete();
							});
						}
					})
				});
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