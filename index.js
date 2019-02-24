require('dotenv').config();
const Discord = require('discord.js');
const format = require('util').format;
const RedisDB = require('./database.js');
const Logs = require('./api/logs.js');
const getRank = require('./api/rank.js');
const recruit = require('./components/recruitment.js');
const ErrorHandling = require('./components/errorhandling.js');

const redis = new RedisDB();
const logapi = new Logs();
const client = new Discord.Client();
const errorHandling = new ErrorHandling(client);

//Global vars
let tChnl, lMsg, recMsg, lastMsg, lastMsgChannel, lastRequest;

client.on('ready', async () => {
	try {
		tChnl = client.channels.get(process.env.TCHNL);
		iChnl = client.channels.get(process.env.ICHNL);

		// get the last message and the last request from redis.
		// i want to clutter the chat as little as possible, by getting the last message and the last request.
		// i can delete those on the next request, i might want to split the admin requests and the common ones.
		let temp = await redis.getKey('lastMsgChannel');
		if (temp === 'OK') {
			lastMsgChannel = client.channels.get(temp);
			temp = undefined;
		}
		
		temp = await redis.getKey('lastMsg');
		if (temp === 'OK' && lastMsgChannel) {
			lastMsg = lastMsgChannel.fetchMessage(temp);
			temp = undefined;
		}

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

			// ----------------------- COLLECT COMMAND AFTER !SPRILL REQUEST ----------------------- //
			collector.on('collect', async (command) => {
				command.delete();	// delete the command message.

				if (command.content === 'rank') {
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
						reply.edit('Caught error, cleaning up trash messages :^)')
						errorHandling.cleanUp(reply.id, reply.channel.id);
					}
				}

				if (command.content === 'logs') {
					try {
						reply.edit('Working...');
						let lastRaid = await logapi.getLastRaid();
						let fights = await logapi.getFights(lastRaid.id);
						let embed = new Discord.RichEmbed()
							.setTitle(format('**%s**', lastRaid.title))
							.setAuthor(command.member.displayName, command.author.avatarURL)
							.setColor('RANDOM')
							.setURL('https://www.warcraftlogs.com/reports/' + lastRaid.id)
							.setDescription(format('**Fights:**\n%s', fights));

						let template = await tChnl.fetchMessage(process.env.TLMSG);
						if (!lMsg) {
							reply.edit(template.content + '\nAnalyzer link:\nhttps://wowanalyzer.com/report/' + lastRaid.id, { embed });
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
						reply.edit('Caught error, cleaning up trash messages :^)')
						errorHandling.cleanUp(reply.id, reply.channel.id);
					}
				}

				if (command.content.includes('recruit')) {
					if (!recMsg) recMsg = await tChnl.fetchMessage('503280236427739146');						// get the recruitment template message.
					let data = await recruit(command.content, recMsg);															// get the new data from the recruitment class.
					if (typeof(data) == 'object' && data.length == 3) {															// check if the returned data is an object (array) and the len is 3.
						let c = await client.channels.get('504248210022334474');											// replace this to get the edited message (if one exists!).
						let m = await c.fetchMessage('546833163314528256');														// this aswell...
						m.edit(recMsg.content + '\n[' + data[2] + '] ' + data[1] + ' - ' + data[0]);	// edit the message, append the data to the content.
						recMsg = m;																																		// save the new message content, so we can edit it later.
						reply.edit(data + ' added to recruitment message');														// edit the reply to tell that the content is added.
						reply.delete(20000);																													// delete the reply.
					}
					else {
						reply.edit(data);
						reply.delete(20000);
					}
				}
			});
		}
		catch (err) {
			console.log(err);
			// gonna need some impressive errorhandling to checkl if redis is accessible or not
			// if i restart the redis container the data is lost as well, but that will be fixed at some point.
		}
	}

	// TESTING //
	if (message.content.includes('!redis') === true) {
		message.delete();
		let set = await redis.setKey('newkey', 'newval');
		console.log(set);
		let get = await redis.getKey('newkey');
		console.log(get);
		await redis.delKey('newkey');
	}

});

client.login(process.env.TOKEN)