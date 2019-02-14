const Discord = require('discord.js');
const dotenv = require('dotenv').config();
const format = require('util').format;
const request = require('request');
const Logs = require('./api/logs');
const logapi = new Logs();

const client = new Discord.Client();

//Global vars
let tChnl, iChnl, lMsg;

client.on('ready', async () => {
	try {
		tChnl = client.channels.get(process.env.TCHNL);
		iChnl = client.channels.get(process.env.ICHNL);
	}
	catch (err) {
		console.log(err);
	}
	console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', async (message) => {
	if ((message.content.includes('!admin') === true) && (message.author.id.includes(process.env.ADMIN) === true)) {
		try {
			message.delete(1000); // Delete !admin request, 
			const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 20000, maxMatches: 2 });
			let reply = await message.reply('Waiting for command');
			collector.on('collect', async (message) => {

				if (message.content == 'rank') {
					message.delete(1000);
					request('https://www.wowprogress.com/guild/eu/argent-dawn/Salvation/json_rank', function (error, response, body) {
						body = JSON.parse(body)
						reply.edit(
							format(
								'__**Guild Ranking**__\n**Score:**\t\t\t\t__%d__\n**World Rank:**\t__%d__\n**Realm rank:**\t __%d__',
								body.score,
								body.world_rank,
								body.realm_rank
							));
					});
				}

				if (message.content == 'logs') {
					try {
						message.delete(1000);
						reply.edit('Working...');
						let lastRaid = await logapi.getLastRaid();
						let fights = await logapi.getFights(lastRaid.id);
						let embed = new Discord.RichEmbed()
							.setTitle(format('**%s**', lastRaid.title))
							.setAuthor(message.author.username, message.author.avatarURL)
							.setColor('RANDOM')
							.setURL('https://www.warcraftlogs.com/reports/' + lastRaid.id)
							.setDescription(format('**Fights:**\n%s', fights));

						let template = await tChnl.fetchMessage(process.env.TLMSG);
						if (!lMsg) {
							reply.edit(template.content + '\n', { embed });
							lMsg = reply;
						}
						else {
							lMsg.delete(1000);
							reply.edit(template.content + '\n', { embed });
						}
					}
					catch (err) {
						console.log(err);
					}
				}

			});
		}
		catch (err) {
			console.log(err);
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