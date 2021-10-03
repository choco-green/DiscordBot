import { Player } from "discord-player";
import { Message, MessageEmbed } from "discord.js";

export function nowPlaying(message: Message, player: Player) {
	const queue = player.getQueue(message.guildId);
	if (!queue || !queue.playing)
		return message.channel.send("There is no song playing currently!");

	const progress = queue.createProgressBar();
	const perc = queue.getPlayerTimestamp();

	// TODO: wrong returns, need to fix
	// Perhaps is the bot getting spotify URL but downloading from YT and timestamps don't match
	return message.channel.send({
		embeds: [
			new MessageEmbed()
				.setColor("#CBC3E3")
				.setTitle("Now Playing")
				.setDescription(`**${queue.current.title}**!`)
				.setFields({ name: "\u200b", value: progress })
		]
	});
}
