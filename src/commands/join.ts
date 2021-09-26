import { Message } from "discord.js";
import { ServerQueue } from "../interfaces";
import { playSong } from "./play";

export async function join(message: Message, serverQueue: ServerQueue, overallQueue: Map<string, ServerQueue>) {
    try {
        const connection = await message.member.voice.channel.join();
        serverQueue.connection = connection;
        playSong(message, serverQueue.songs[0], serverQueue, overallQueue);
    } catch (err) {
        console.log(err);
        overallQueue.delete(message.guild.id);
        return message.channel.send(err);
    }
}