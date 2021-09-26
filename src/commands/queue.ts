import { Message } from "discord.js";
import { ServerQueue } from "../interfaces";

export function queue(message: Message, serverQueue: ServerQueue) {
    for (let i = 0; i < serverQueue.songs.length; i++) {
        message.channel.send(`**${i + 1}.** ${serverQueue.songs[i].title}`);
    }
}