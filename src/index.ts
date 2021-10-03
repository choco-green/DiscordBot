import { Player } from "discord-player";
import { Client, Message, MessageEmbed } from "discord.js";
import * as dotenv from "dotenv";
import { help, nowPlaying, play, queue, shuffle, skip, stop } from "./Commands";
import { stateCheckingForBot } from "./Utils/stateChecking";
dotenv.config();

// ! Proxies may be needed for the bot, some videos are not availble
// ! example: https://www.youtube.com/watch?v=d1Nq82S7_0Q

// const mongoClient = new MongoClient(process.env.URI);
// mongoClient.connect(async err => {
//     const collection = mongoClient.db("testing").collection("main");
//     console.log(`collection`, await collection.findOne({ "_id": "776080120309743656" }));
//     mongoClient.close();
// });

// Discord Client
const client = new Client({
	intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]
});

// Discord-Player Client
const player = new Player(client, {
	ytdlOptions: { quality: "highestaudio", highWaterMark: 1024 * 1024 * 32 }
});

// Called when the bot is first initialised
client.once("ready", () => {
	console.log("bot ready");
	if (!client.user) return;
	client.user.setActivity("commands|$help", { type: "LISTENING" });
});

// Called when a new message is sent in any channel in any guild
client.on("messageCreate", (message) => {
	const msgContent = message.content.toLowerCase();
	const prefix = process.env.PREFIX || "$";

	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	// todo: connect to a database
	switch (true) {
		// Full commands
		case msgContent.startsWith(`${prefix}play`):
			play(message, player);
			break;
		case msgContent.startsWith(`${prefix}shuffle`):
			shuffle(message, player);
			break;
		case msgContent.startsWith(`${prefix}skip`):
			skip(message, player);
			break;
		case msgContent.startsWith(`${prefix}stop`):
			stop(message, player);
			break;
		case msgContent.startsWith(`${prefix}queue`):
			queue(message, player);
			break;
		case msgContent.startsWith(`${prefix}nowplaying`):
			nowPlaying(message, player);
			break;
		case msgContent.startsWith(`${prefix}help`):
			help(message);
			break;

		// Shorthand commands
		case msgContent.startsWith(`${prefix}p`):
			// makes $p to $play, this is needed due to string slicing in play()
			message.content = [
				message.content.slice(0, 2) + "lay" + message.content.slice(2)
			].join();
			play(message, player);
			break;
		case msgContent.startsWith(`${prefix}s`):
			skip(message, player);
			break;
		case msgContent.startsWith(`${prefix}q`):
			queue(message, player);
			break;
		case msgContent.startsWith(`${prefix}np`):
			nowPlaying(message, player);
			break;
		default:
			message.channel.send("You need to enter a valid command!");
			break;
	}
});

// Making the bot leave if there aren't any other user in the same channel as the bot
client.on("voiceStateUpdate", (oldMember, newMember) => {
	stateCheckingForBot(newMember, player);
});

// Error handling for the discord-player
player.on("error", (q, error) => {
	console.error(error);
});

// Logs in <3
client.login(process.env.TOKEN);
