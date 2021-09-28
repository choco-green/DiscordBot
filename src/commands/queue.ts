import { Player } from "discord-player";
import { Message } from "discord.js";

export function queue(message: Message, player: Player) {
    const queue = player.getQueue(message.guildId);
    if (!queue || !queue.playing) return message.channel.send("No music is being played");

    for (let i = 0; i < queue.tracks.length; i++) { message.channel.send(`${i + 1}. **${queue.tracks[i]}**`); }

    // TODO: discord card style, rather than for loop
}