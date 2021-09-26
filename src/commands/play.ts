import { Guild, Message } from "discord.js";
import YouTube, { Video } from "youtube-sr";
import { ServerQueue, Song } from "../interfaces";
import ytdl = require("ytdl-core");

const queue = new Map();
const spotifyRegex = new RegExp(/^(?:https:\/\/open\.spotify\.com|spotify)([\/:])user\1([^\/]+)\1playlist\1([a-z0-9]+)/);

export async function play(message: Message, serverQueue: ServerQueue) {

    // Splices message to remove the ({prefix}play )
    const messageContent = message.content.slice(6);

    // Checking conditions
    if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to play music!");
    if (!message.member.voice.channel.permissionsFor(message.client.user).has("CONNECT")) return message.channel.send("I need the permission to be able to join your voice channel!");
    if (!message.member.voice.channel.permissionsFor(message.client.user).has("SPEAK")) return message.channel.send("I need the permission for speaking in your voice channel!");

    // Example of a valid video: https://www.youtube.com/watch?v=RWeyOyY_puQ

    if (YouTube.validate(messageContent, "VIDEO") && !messageContent.includes("list")) {
        // Accessing API
        getVideo(messageContent, message, serverQueue);

    } else if (YouTube.validate(messageContent, "VIDEO_ID") && !messageContent.includes("list")) {
        // Accessing API with concat string
        getVideo(`https://www.youtube.com/watch?v=${messageContent}`, message, serverQueue);

    } else if (YouTube.validate(messageContent, "PLAYLIST")) {
        // Accessing API for each video in playlist
        YouTube.getPlaylist(messageContent)
            .then(playlist => playlist.fetch(1)) // fetch of 100 videos at one time
            .then(playlist => {
                // todo: ordering?
                playlist.videos.forEach(video => {
                    getVideo(`https://www.youtube.com/watch?v=${video.id}`, message, serverQueue);
                });
            }) // all parsable videos
            .catch(console.error);

    } else if (YouTube.validate(messageContent, "PLAYLIST_ID")) {
        // Accessing API for each video in playlist with concat string
        YouTube.getPlaylist(`https://www.youtube.com/playlist?list=${messageContent}`)
            .then(playlist => playlist.fetch()) // fetch of 100 videos at one time
            .then(playlist => {
                playlist.videos.forEach(video => {
                    getVideo(`https://www.youtube.com/watch?v=${video.id}`, message, serverQueue);
                });
            }) // all parsable videos
            .catch(console.error);

    } else if (spotifyRegex.test(messageContent)) {
        // Calls spotify API

    } else {
        YouTube.searchOne(messageContent).then(video => getVideo(`https://www.youtube.com/watch?v=${video.id}`, message, serverQueue));
    }
}

function playSong(guild: Guild, song: Song) {
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
            playSong(guild, serverQueue.songs[0]);
            serverQueue.textChannel.send(`Start playing: **${song.title}**`);
        })
        .on("error", (error: Error) => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

}

async function getVideo(messageContent: string, message: Message, serverQueue: ServerQueue) {
    await YouTube.getVideo(messageContent)
        .then(async video => {
            // TODO: can add more things such as who the song is added by, or thumbnail, or more
            const song = {
                title: video.title,
                url: `https://www.youtube.com/watch?v=${video.id}`
            };

            if (!serverQueue) {
                const queueConstruct = {
                    textChannel: message.channel, // channel of which the user typed the message in
                    voiceChannel: message.member.voice.channel, // voice channel which user is in while sending the message
                    connection: null, // connection status of the bot
                    songs: [], // list of songs
                    volume: 2, // todo: need to figure this shit out
                    playing: true // default
                };
                queue.set(message.guild.id, queueConstruct);
                queueConstruct.songs.push(song);
                try {
                    const connection = await message.member.voice.channel.join();
                    queueConstruct.connection = connection;
                    playSong(message.guild, queueConstruct.songs[0]);
                } catch (err) {
                    console.log(err);
                    queue.delete(message.guild.id);
                    return message.channel.send(err);
                }
            } else {
                serverQueue.songs.push(song);
                // TODO: emergency patch this
                return message.channel.send(`${song.title} has been added to the queue!`);
            }
        })
        .catch(err => console.error(err));
}