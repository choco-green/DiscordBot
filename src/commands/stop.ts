import { Message } from "discord.js";
import { ServerQueue } from "../interfaces";

export function stop(message: Message, serverQueue: ServerQueue) {
    if (!message.member.voice.channel) return message.channel.send("You have to be in a voice channel to stop the music!");
    if (!serverQueue) return message.channel.send("There is no song that I could stop!");

    while (serverQueue.songs.length > 0) serverQueue.songs.pop();
    serverQueue.connection.dispatcher.end();
}