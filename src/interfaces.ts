import { TextChannel, VoiceChannel, VoiceConnection } from "discord.js";

export interface Song {
    title: string;
    url: string;
}

export interface ServerQueue {
    textChannel: TextChannel; // channel of which the user typed the message in
    voiceChannel: VoiceChannel; // voice channel which user is in while sending the message
    connection: VoiceConnection; // connection status of the bot
    songs: [{
        title: string;
        url: string;
    }]; // list of songs
    volume: number;
    playing: boolean;
}