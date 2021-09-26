import { Client } from "@typeit/discord";
import { Guild, Message } from "discord.js";
import ytdl = require("ytdl-core");
import { prefix, TOKEN } from "../config";
import YouTube from "youtube-sr";
import { Url } from "url";
import { Song, ServerQueue } from "./interfaces";
import { play } from "./commands/play";

const client = new Client();
const queue = new Map();

client.once("ready", () => {
    console.log("Ready!");
    client.user.setActivity("ur mum (lol)", { type: 'WATCHING' });
});

client.on("message", async message => {

    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${prefix}play`)) {
        play(message, serverQueue);
        return;
    }
    // else if (message.content.startsWith(`${prefix}skip`)) {
    //     skip(message, serverQueue);
    //     return;
    // } else if (message.content.startsWith(`${prefix}stop`)) {
    //     stop(message, serverQueue);
    //     return;
    // }
    else {
        message.channel.send("You need to enter a valid command!");
    }
});

// function skip(message: Message, serverQueue: { connection: { dispatcher: { end: () => void; }; }; }) {
//     if (!message.member.voice.channel)
//         return message.channel.send(
//             "You have to be in a voice channel to stop the music!"
//         );
//     if (!serverQueue)
//         return message.channel.send("There is no song that I could skip!");
//     serverQueue.connection.dispatcher.end();
// }

// function stop(message: Message, serverQueue: { songs: any[]; connection: { dispatcher: { end: () => void; }; }; }) {
//     if (!message.member.voice.channel)
//         return message.channel.send(
//             "You have to be in a voice channel to stop the music!"
//         );

//     if (!serverQueue)
//         return message.channel.send("There is no song that I could stop!");

//     serverQueue.songs = [];
//     serverQueue.connection.dispatcher.end();
// }

client.login(TOKEN);