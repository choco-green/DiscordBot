import { VoiceConnection } from "@discordjs/voice";
import { Channel, DMChannel, NewsChannel, StageChannel, TextBasedChannels, TextChannel, VoiceChannel } from "discord.js";

export interface Song {
    title: string;
    url: string;
    thumbnail: string;
}

export interface ServerQueue {
    textChannel: TextChannel | NewsChannel | DMChannel | TextBasedChannels; // channel of which the user typed the message in
    voiceChannel: VoiceChannel | StageChannel; // voice channel which user is in while sending the message
    connection: VoiceConnection; // connection status of the bot
    songs: {
        title: string;
        url: string;
        thumbnail: string;
    }[];
    volume: number;
    playing: boolean;
}