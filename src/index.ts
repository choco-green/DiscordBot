import { Player } from "discord-player";
import { Client } from "discord.js";
import { play, queue, skip, stop, nowPlaying } from "./commands/commands";
import * as dotenv from "dotenv";
import { stateCheckingForBot } from "./Utils/stateChecking";
dotenv.config();

// ! Discord event cheat sheet here: https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584

const client = new Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]
});

const player = new Player(client);

client.once("ready", () => {
    console.log("Ready!");
    client.user.setActivity("ur mum (lol)", { type: 'WATCHING' });
});

client.on("messageCreate", message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) return;

    // todo: connect to a database

    switch (true) {
        case message.content.startsWith(`${process.env.PREFIX}play`):
            play(message, player);
            break;
        case message.content.startsWith(`${process.env.PREFIX}skip`):
            skip(message, player);
            break;
        case message.content.startsWith(`${process.env.PREFIX}stop`):
            stop(message, player);
            break;
        case message.content.startsWith(`${process.env.PREFIX}queue`):
            queue(message, player);
            break;
        case message.content.startsWith(`${process.env.PREFIX}nowplaying`):
            nowPlaying(message, player);
            break;
        default:
            message.channel.send("You need to enter a valid command!");
            break;
    }
});

client.on("voiceStateUpdate", (oldMember, newMember) => {
    stateCheckingForBot(newMember, player);
});

client.login(process.env.TOKEN);