import { Client } from "@typeit/discord";
import { Guild, Message } from "discord.js";
import ytdl = require("ytdl-core");
import { TOKEN } from "../config";
import YouTube from "youtube-sr";
import { Url } from "url";
import { Song, ServerQueue } from "./interfaces";

const client = new Client();
const prefix = "$";
const queue = new Map();

client.once("ready", () => {
    console.log("Ready!");
});

client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const serverQueue = queue.get(message.guild.id);

    console.log(serverQueue);
    message.channel.send(serverQueue + "");
    console.log(queue);

    if (message.content.startsWith(`${prefix}play`)) {
        execute(message, serverQueue);
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

async function execute(message: Message, serverQueue: ServerQueue) {
    const args = message.content.split(" ");

    // if user entered "play " -> invalid, returns
    if (!args[1]) return message.channel.send("Stop trying to break me!");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send("You need to be in a voice channel to play music!");

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return message.channel.send("I need the permissions to join and speak in your voice channel!");

    try {
        const songInfo = await ytdl.getInfo(args[1]);
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
        };
        if (!serverQueue) {
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel,
                connection: null,
                songs: [],
                volume: 2,
                playing: true
            };
            queue.set(message.guild.id, queueConstruct);
            queueConstruct.songs.push(song);
            try {
                const connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                play(message.guild, queueConstruct.songs[0]);
            } catch (err) {
                console.log(err);
                queue.delete(message.guild.id);
                return message.channel.send(err);
            }
        } else {
            serverQueue.songs.push(song);
            return message.channel.send(`${song.title} has been added to the queue!`);
        }
    } catch (error) {
        message.channel.send("Something wrong happened, please try again later");
        console.error(error);
        return;
    }
}

function play(guild: Guild, song: Song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", (error: Error) => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}


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