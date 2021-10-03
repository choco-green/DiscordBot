import { Message, MessageEmbed } from "discord.js";

export function help(message: Message) {
	const prefix = process.env.PREFIX;
	return message.channel.send({
		embeds: [
			new MessageEmbed()
				.setColor("#CBC3E3")
				.setTitle(`**All Commands available**`)
				.setDescription("Here is all the available commands in the server!")
				.addFields(
					{
						name: "Now Playing",
						value: `**${prefix}nowplaying** or **${prefix}np** \n list song currently playing`
					},
					{
						name: "Play",
						value: `**${prefix}play** or **${prefix}p** \n plays a song or a playlist`
					},
					{
						name: "Queue",
						value: `**${prefix}queue** or **${prefix}q** \n list songs in the queue`
					},
					{
						name: "Shuffle",
						value: `**${prefix}shuffle** \n shuffles the songs in queue`
					},
					{
						name: "Skip",
						value: `**${prefix}skip** or **${prefix}s** \n skips the current song`
					},
					{
						name: "Stop",
						value: `**${prefix}stop** \n stops the bot :( `
					}
				)
				.setImage("https://imgur.com/xKu5k82")
				.setTimestamp()
				.setFooter(
					`This message was requested by ${message.author.username}`,
					message.author.avatarURL() as string
				)
		]
	});
}
