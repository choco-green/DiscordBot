import { Player } from "discord-player";
import { Client } from "discord.js";
import * as dotenv from "dotenv";
import { help, nowPlaying, play, queue, shuffle, skip, stop } from "./Commands";
import { stateCheckingForBot } from "./Utils/stateChecking";
dotenv.config();

// const mongoClient = new MongoClient(process.env.URI);
// mongoClient.connect(async err => {
//     const collection = mongoClient.db("testing").collection("main");
//     console.log(`collection`, await collection.findOne({ "_id": "776080120309743656" }));
//     mongoClient.close();
// });

// ! Discord event cheat sheet here: https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584

// ! Important, new song skips queue sometimes? unstable

const client = new Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]
});

const player = new Player(client);

client.once("ready", () => {
    client.user.setActivity("commands <3", { type: 'LISTENING' });
});

client.on("messageCreate", message => {
    const msgContent = message.content.toLowerCase();
    const prefix = process.env.PREFIX;
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    // todo: connect to a database
    switch (true) {
        case msgContent.startsWith(`${prefix}play`):
        case msgContent.startsWith(`${prefix}p`):
            play(message, player);
            break;
        case msgContent.startsWith(`${prefix}shuffle`):
            shuffle(message, player);
            break;
        case msgContent.startsWith(`${prefix}skip`):
        case msgContent.startsWith(`${prefix}s`):
            skip(message, player);
            break;
        case msgContent.startsWith(`${prefix}stop`):
            stop(message, player);
            break;
        case msgContent.startsWith(`${prefix}queue`):
        case msgContent.startsWith(`${prefix}q`):
            queue(message, player);
            break;
        case msgContent.startsWith(`${prefix}nowplaying`):
        case msgContent.startsWith(`${prefix}np`):
            nowPlaying(message, player);
            break;
        case msgContent.startsWith(`${prefix}help`):
            help(message);
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
