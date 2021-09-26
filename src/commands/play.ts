import { Message } from "discord.js";
import YouTube from "youtube-sr";
import { ServerQueue, Song } from "../interfaces";
import ytdl = require("ytdl-core");

const spotifyRegex = new RegExp(/^(?:https:\/\/open\.spotify\.com|spotify)([\/:])user\1([^\/]+)\1playlist\1([a-z0-9]+)/);
// ! Discord event cheat sheet here: https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584

export async function play(message: Message, serverQueue: ServerQueue, OverallQueue: Map<string, ServerQueue>) {

    // Splices message to remove the ({prefix}play )
    const messageContent = message.content.slice(6);

    // Checking conditions
    if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to play music!");
    if (!message.member.voice.channel.permissionsFor(message.client.user).has("CONNECT")) return message.channel.send("I need the permission to be able to join your voice channel!");
    if (!message.member.voice.channel.permissionsFor(message.client.user).has("SPEAK")) return message.channel.send("I need the permission for speaking in your voice channel!");

    // Example of a valid video: https://www.youtube.com/watch?v=RWeyOyY_puQ

    if (YouTube.validate(messageContent, "VIDEO") && !messageContent.includes("list")) {
        // Accessing API
        getVideo(messageContent, message, serverQueue, OverallQueue);

    } else if (YouTube.validate(messageContent, "VIDEO_ID") && !messageContent.includes("list")) {
        // Accessing API with concat string
        getVideo(`https://www.youtube.com/watch?v=${messageContent}`, message, serverQueue, OverallQueue);

    } else if (YouTube.validate(messageContent, "PLAYLIST")) {
        // Accessing API for each video in playlist
        getPlaylistVideo(messageContent, message, serverQueue, OverallQueue);

    } else if (YouTube.validate(messageContent, "PLAYLIST_ID")) {
        // Accessing API for each video in playlist with concat string
        getPlaylistVideo(`https://www.youtube.com/playlist?list=${messageContent}`, message, serverQueue, OverallQueue);

    } else if (spotifyRegex.test(messageContent)) {
        // Calls spotify API

    } else {
        YouTube.searchOne(messageContent).then(video => getVideo(`https://www.youtube.com/watch?v=${video.id}`, message, serverQueue, OverallQueue));
    }
}

async function getVideo(messageContent: string, message: Message, serverQueue: ServerQueue, overallQueue: Map<string, ServerQueue>) {
    await YouTube.getVideo(messageContent)
        .then(async video => {
            // TODO: can add more things such as who the song is added by, or thumbnail, or more
            serverQueue.songs.push({
                title: video.title,
                url: `https://www.youtube.com/watch?v=${video.id}`,
                thumbnail: video.thumbnail.url
            });

            if (serverQueue.connection)
                message.channel.send(`${video.title} has been added to the queue!`, { files: [video.thumbnail.url] });

            // Try to join user's VC
            if (!serverQueue.connection) {
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
        })
        .catch(err => console.error(err));
}

async function getPlaylistVideo(link: string, message: Message, serverQueue: ServerQueue, overallQueue: Map<string, ServerQueue>) {
    YouTube.getPlaylist(link)
        .then(playlist => playlist.fetch()) // fetch of 100 videos at one time
        .then(playlist => {
            playlist.videos.forEach(video => {
                serverQueue.songs.push({
                    title: video.title,
                    url: `https://www.youtube.com/watch?v=${video.id}`,
                    thumbnail: video.thumbnail.url
                });
                console.log("added");
            });
        }) // all parsable videos
        .then(() => message.channel.send("All videos in the playlist have been added to the channel"))
        .then(async () => {
            if (!serverQueue.connection) {
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
        })
        .catch(console.error);
}

export function playSong(message: Message, song: Song, serverQueue: ServerQueue, overallQueue: Map<string, ServerQueue>) {
    /**
     * Plays a given song
     *
     * @param message - The message user have sent
     * @param song - The song that gets played
     * @param serverQueue - The list of songs in a given guild
     * @param overallQueue - The list of songs accross all guilds
     *
     */
    if (!song) {
        serverQueue.voiceChannel.leave();
        overallQueue.delete(message.guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            playSong(message, serverQueue.songs[0], serverQueue, overallQueue);
        });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`, { files: [song.thumbnail] });
}