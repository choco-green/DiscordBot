import { VoiceChannel } from "discord.js";
import { Message } from "discord.js";
import YouTube, { Video } from "youtube-sr";
import ytdl = require("ytdl-core");
import { prefix } from "../../config";
import { ServerQueue, Song } from "../interfaces";

const spotifyRegex = new RegExp(/^(?:https:\/\/open\.spotify\.com|spotify)([\/:])user\1([^\/]+)\1playlist\1([a-z0-9]+)/);



export async function play(message: Message, serverQueue: ServerQueue) {

    // Splices message to remove the ({prefix}play )
    const messageContent = message.content.slice(5);

    if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to play music!");
    if (!message.member.voice.channel.permissionsFor(message.client.user).has("CONNECT")) return message.channel.send("I need the permission to be able to join your voice channel!");
    if (!message.member.voice.channel.permissionsFor(message.client.user).has("SPEAK")) return message.channel.send("I need the permission for speaking in your voice channel!");

    if (YouTube.validate(messageContent, "VIDEO")) {
        const video: Promise<any> = YouTube.getVideo(messageContent).catch(console.error);
        const song = songParsing(video);
        if (!serverQueue) {
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel = message.member.voice.channel,
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
    }
    else if (YouTube.validate(messageContent, "VIDEO_ID")) {
        YouTube.getVideo(`https://www.youtube.com/watch?v=${messageContent}`)
            .then(console.log)
            .catch(console.error);

    } else if (YouTube.validate(messageContent, "PLAYLIST")) {
        YouTube.getPlaylist(messageContent)
            .then(playlist => playlist.fetch()) // fetch of 100 videos at one time
            .then(console.log) // all parsable videos
            .catch(console.error);

    } else if (YouTube.validate(messageContent, "PLAYLIST_ID")) {
        YouTube.getPlaylist(`https://www.youtube.com/playlist?list=${messageContent}`)
            .then(playlist => playlist.fetch()) // fetch of 100 videos at one time
            .then(console.log) // all parsable videos
            .catch(console.error);

    } else if (spotifyRegex.test(messageContent)) {
        // Calls spotify API

    }
    /*
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
    */

}

async function songParsing(video: Promise<Video>) {
    const song = {
        // TODO: can add more things such as who the song is added by, or thumbnail, or more
        title: (await video).title,
        url: `https://www.youtube.com/watch?v=${(await video).id}`,
    };
    return song;
}