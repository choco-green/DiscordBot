import { Player } from "discord-player";
import { Client } from "discord.js";
import { play, queue, skip, stop } from "./commands/commands";
import * as dotenv from "dotenv";
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

    if (message.content.startsWith(`${process.env.PREFIX}play`)) {
        play(message, player);
        return;
    } else if (message.content.startsWith(`${process.env.PREFIX}skip`)) {
        skip(message, player);
        return;
    } else if (message.content.startsWith(`${process.env.PREFIX}stop`)) {
        stop(message, player);
        return;
    } else if (message.content.startsWith(`${process.env.PREFIX}queue`)) {
        queue(message, player);
        return;
    } else {
        message.channel.send("You need to enter a valid command!");
    }
});

client.on("disconnect", () => {
    // I believe this is the event for anything disconnecting from VC
    // todo: if it is the bot disconnecting, it needs to delete latest songs etc
});

client.login(process.env.TOKEN);