const Discord = require('discord.js');
const dotenv = require('dotenv').config();

const client = new Discord.Client();

client.on('ready', () => {
	console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
	if (message.content.includes('!admin') === true) {
		if (message.author.id.includes(process.env.ADMIN) === true) {
				message.reply('ye')
					.then(result => result.edit('Yes'))
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