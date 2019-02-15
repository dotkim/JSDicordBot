require('dotenv').config();
const Discord = require('discord.js');
const format = require('util').format;
const Logs = require('./api/logs.js');
const getRank = require('./api/rank.js');
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
	if (message.content.includes('!sprill') === true) {
		try {
			message.delete(); // Delete !sprill request, 
			const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 20000, maxMatches: 2 });
			let reply = await message.reply('Waiting for command');
			collector.on('collect', async (message) => {

				if (message.content == 'rank') {
					message.delete();
					try {
						let replyContent = await getRank();
						if (!lMsg) {
							reply.edit(replyContent);
							lMsg = reply;
						}
						else {
							lMsg.delete();
							reply.edit(replyContent);
							lMsg = reply;
						}
					}
					catch (err) {
						console.log(err);
					}
				}

				if (message.content == 'logs') {
					try {
						message.delete();
						reply.edit('Working...');
						let lastRaid = await logapi.getLastRaid();
						let fights = await logapi.getFights(lastRaid.id);
						let embed = new Discord.RichEmbed()
							.setTitle(format('**%s**', lastRaid.title))
							.setAuthor(message.member.displayName, message.author.avatarURL)
							.setColor('RANDOM')
							.setURL('https://www.warcraftlogs.com/reports/' + lastRaid.id)
							.setDescription(format('**Fights:**\n%s', fights));

						let template = await tChnl.fetchMessage(process.env.TLMSG);
						if (!lMsg) {
							reply.edit(template.content + '\n', { embed });
							lMsg = reply;
						}
						else {
							lMsg.delete();
							reply.edit(template.content + '\n', { embed });
							lMsg = reply;
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
});

client.login(process.env.TOKEN)