import { Player } from "discord-player";
import { Client, Message } from "discord.js";
import { prefix, TOKEN } from "../config";
import { play } from "./commands/commands";
import { ServerQueue } from "./interfaces";

// ! Discord event cheat sheet here: https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584

const client = new Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]
});
const player = new Player(client);
const overallQueue = new Map();


client.once("ready", () => {
    console.log("Ready!");
    client.user.setActivity("ur mum (lol)", { type: 'WATCHING' });
});

client.on("messageCreate", message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const serverQueue = init(message);

    if (message.content.startsWith(`${prefix}play`)) {
        play(message, player);
        return;
    } /*else if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}queue`)) {
        queue(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}join`)) {
        join(message, serverQueue, overallQueue);
    } */else {
        message.channel.send("You need to enter a valid command!");
    }
});

client.on("disconnect", () => {
    // I believe this is the event for anything disconnecting from VC
    // todo: if it is the bot disconnecting, it needs to delete latest songs etc
});

client.login(TOKEN);

function init(message: Message) {
    const serverQueue: ServerQueue = overallQueue.get(message.guild.id);
    if (!serverQueue) {
        const queueConstruct: ServerQueue = {
            textChannel: message.channel, // channel of which the user typed the message in
            voiceChannel: message.member.voice.channel, // voice channel which user is in while sending the message
            connection: null, // connection status of the bot
            songs: [], // list of songs
            volume: 2, // todo: need to figure this shit out
            playing: true // default
        };
        overallQueue.set(message.guild.id, queueConstruct);
    }
    return overallQueue.get(message.guild.id);
}