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
		let bosses = ""
		for (i in body.fights) {
			let curFight = body.fights[i]
			if (curFight.kill != undefined && curFight.boss != 0) {
				if (!bosses.includes(curFight.name)) {
					bosses = curFight.name
				}
			}
		}
		console.log(bosses)
		return callback(bosses)
	})
}

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
								result.edit(format('__**Guild Ranking**__\n**Score:**\t\t\t\t__%d__\n**World Rank:**\t__%d__\n**Realm rank:**\t __%d__', body.score, body.world_rank, body.realm_rank));
							});
						}
						if (message.content == 'logs') {
							request('https://www.warcraftlogs.com:443/v1/reports/guild/Salvation/Argent-Dawn/EU?start=1538156088557&api_key=' + process.env.APIKEY, (error, response, body) => {
								body = JSON.parse(body)
								url = 'https://www.warcraftlogs.com:443/v1/report/fights/' + body[0].id + '?translate=false&api_key=' + process.env.APIKEY
								let embed = new Discord.RichEmbed()
									.setTitle(format('**Logname: %s**', body[0].title))
									.setAuthor(message.author.username, message.author.avatarURL)
									.setColor('RANDOM')
									.setURL('https://www.warcraftlogs.com/reports/' + body[0].id)
									.setDescription(
										format('Bosses:\n%s', getFights(url, (callback) => callback))
									);
								infoChannel = client.channels.get(process.env.INFOCHANNEL)
								templateChannel = client.channels.get(process.env.TEMPLATECHANNEL)
								templateChannel.fetchMessage(process.env.PROGRESSMESSAGEID)
									.then(message => {
										/* infoChannel.send(message.content + '\n', { embed })
											.then() */
									})
									.catch(console.error);
								result.edit({ embed });
								message.delete();
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