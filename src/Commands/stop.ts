import { Player } from "discord-player";
import { Message } from "discord.js";

export function stop(message: Message, player: Player) {
	const queue = player.getQueue(message.guildId);
	if (!message.member.voice.channel)
		return message.channel.send("You have to be in a voice channel to stop the music!");
	if (
		message.member.voice.channelId &&
		message.member.voice.channelId !== message.guild.me.voice.channelId
	)
		return message.channel.send(
			"You can only stop the player when you are in the same voice channel as the bot"
		);
	if (!queue || !queue.playing) return message.channel.send("No music is being played");

	queue.destroy();
	message.channel.send("Stopped the player");
}
