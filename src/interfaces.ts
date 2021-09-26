import { Channel, DMChannel, NewsChannel, TextChannel, VoiceChannel, VoiceConnection } from "discord.js";

export interface Song {
    title: string;
    url: string;
    thumbnail: string;
}

export interface ServerQueue {
    textChannel: TextChannel | NewsChannel | DMChannel; // channel of which the user typed the message in
    voiceChannel: VoiceChannel; // voice channel which user is in while sending the message
    connection: VoiceConnection; // connection status of the bot
    songs: {
        title: string;
        url: string;
        thumbnail: string;
    }[];
    volume: number;
    playing: boolean;
}