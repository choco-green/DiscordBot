import { Player } from "discord-player";
import { Message } from "discord.js";

export function skip(message: Message, player: Player) {
    const queue = player.getQueue(message.guildId);
    const oldTrack = queue.current;
    if (!message.member.voice.channel) return message.channel.send("You have to be in a voice channel to stop the music!");
    if (message.member.voice.channelId && message.member.voice.channelId !== message.guild.me.voice.channelId) return message.channel.send("You can only skip songs you are in the same voice channel as the bot");
    if (!queue) return message.channel.send("There is no song that I could skip!");
    if (!queue.playing) return message.channel.send("I can't skip any song if I'm not even playing them");

    message.channel.send(queue.skip() ? `Skipped **${oldTrack}**` : `Something went wrong, track not skipped`);

    // todo: display now playing when songs skipped
}