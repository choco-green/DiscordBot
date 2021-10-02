import { Player, Queue } from "discord-player";
import { Message } from "discord.js";
import { queue } from "./queue";


export function shuffle(message: Message, player: Player) {
    const serverQueue: Queue = player.getQueue(message.guildId);
    for (let i = serverQueue.tracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [serverQueue.tracks[i], serverQueue.tracks[j]] = [serverQueue.tracks[j], serverQueue.tracks[i]];
    }
    message.channel.send("Shuffled!");
    message.channel.send("**Here is the Queue**");
    return queue(message, player);
}