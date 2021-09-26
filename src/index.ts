import { Client } from "@typeit/discord";
import { Message } from "discord.js";
import { prefix, TOKEN } from "../config";
import { play, skip, stop } from "./commands/commands";
import { ServerQueue } from "./interfaces";

const client = new Client();
const queue = new Map();

client.once("ready", () => {
    console.log("Ready!");
    client.user.setActivity("ur mum (lol)", { type: 'WATCHING' });
});

client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const serverQueue = init(message);

    if (message.content.startsWith(`${prefix}play`)) {
        play(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);
        return;
    } else {
        message.channel.send("You need to enter a valid command!");
    }
});

client.login(TOKEN);

function init(message: Message) {
    const serverQueue: ServerQueue = queue.get(message.guild.id);
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
    }
    return queue.get(message.guild.id);
}