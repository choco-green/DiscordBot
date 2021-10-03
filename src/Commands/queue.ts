import { Player, Queue } from "discord-player";
import { Guild, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { formatTime } from "../Utils/formatTime";

export async function queue(message: Message, player: Player) {
	if (
		!player.getQueue(message.guild as Guild) ||
		!player.getQueue(message.guild as Guild).playing
	)
		return message.channel.send("No music is being played");

	let index = {
		index: 0,
		get get(): number {
			return this.index;
		},
		set set(value: number) {
			this.index = value;
		}
	};

	const amountInPage = 10; // Amount of songs displayed on one page
	const pages: MessageEmbed[] = createPages(amountInPage, message, player); // The list of pages that will be displayed
	const collector = message.channel.createMessageComponentCollector({ time: 60000 }); // Collector for user interation

	// Handling User's interation with the button in Queue
	collector.on("collect", async (i) => {
		if (i.customId === "prev") {
			index.set = index.get - 1 < 0 ? 0 : index.get - 1;
			await i.update({
				embeds: [pages[index.get]],
				components: [buttons(index.get, pages)]
			});
		}
		if (i.customId === "next") {
			index.set = index.get + 1 > pages.length - 1 ? pages.length - 1 : index.get + 1;
			await i.update({
				embeds: [pages[index.get]],
				components: [buttons(index.get, pages)]
			});
		}
	});

	// Initial message sent to user
	message.channel.send({
		embeds: [pages[index.get]],
		components: [buttons(index.get, pages)]
	});
}

enum ValueType {
	Title,
	Length,
	RequestedBy
}

// Creates embedded messages based on values from "getValue"
function createPages(pageCount: number, message: Message, player: Player) {
	const serverQueue = player.getQueue(message.guild as Guild);
	const titleValue = getValue(serverQueue, pageCount, ValueType.Title);
	const lengthValue = getValue(serverQueue, pageCount, ValueType.Length);
	const requestedByValue = getValue(serverQueue, pageCount, ValueType.RequestedBy);

	// Creation of pages
	const pages: MessageEmbed[] = [];
	for (let i = 0; i < titleValue.length; i++) {
		const values = [
			titleValue[i],
			lengthValue[i],
			requestedByValue[i],
			`(${i + 1}/${titleValue.length})`
		];
		pages.push(createEmbeddedMessage(values, message, player));
	}

	return pages;
}

function getValue(serverQueue: Queue, pageCount: number, valueType: ValueType) {
	const values: string[] = [];
	let value = "";

	for (let i = 0; i <= serverQueue.tracks.length; i++) {
		const currentTrack = serverQueue.tracks[i];
		// Makes a new page when "i" is a factor of "pageCount"
		if ((i % pageCount === 0 && i !== 0) || i === serverQueue.tracks.length) {
			values.push(value);
			value = "";
		}
		if (i !== serverQueue.tracks.length) {
			switch (valueType) {
				case ValueType.Title:
					value += `${i + 1}. [${currentTrack.title}](${currentTrack.url})\n`;
					break;
				case ValueType.Length:
					value += `${currentTrack.duration}\n`;
					break;
				case ValueType.RequestedBy:
					value += `${currentTrack.requestedBy.username}\n`;
					break;
			}
		}
	}
	return values;
}

// Creates embedded messages based on each indivisual page
function createEmbeddedMessage(value: string[], message: Message, player: Player) {
	const serverQueue = player.getQueue(message.guild as Guild);
	const nowPlaying = serverQueue.nowPlaying();

	return new MessageEmbed()
		.setColor("#CBC3E3")
		.setTitle("Current Queue")
		.setDescription(
			`Now playing: \n [${nowPlaying}](${nowPlaying.url})  \`${nowPlaying.duration} | Requested by: ${nowPlaying.requestedBy.username}\``
		)
		.addField("Pos/Title", value[0], true)
		.addField("Length", value[1], true)
		.addField("Requested By", value[2], true)
		.addField("Songs in Queue", `${serverQueue.tracks.length} Songs`, true)
		.addField("Total Length", formatTime(serverQueue.tracks), true)
		.addField("Page", value[3], true)
		.setTimestamp()
		.setFooter(
			`This message was requested by ${message.author.username}`,
			message.author.avatarURL() as string
		);
}

// A function that figures out whether or not the buttons should be enabled or disabled for each page
function buttons(index: number, pages: MessageEmbed[]) {
	// Types of buttons
	const prevButton = new MessageButton()
		.setCustomId("prev")
		.setLabel("Prev Page")
		.setStyle("PRIMARY");
	const nextButton = new MessageButton()
		.setCustomId("next")
		.setLabel("Next Page")
		.setStyle("PRIMARY");
	const prevButtonDisabled = new MessageButton()
		.setCustomId("prev")
		.setLabel("Prev Page")
		.setStyle("PRIMARY")
		.setDisabled();
	const nextButtonDisabled = new MessageButton()
		.setCustomId("next")
		.setLabel("Next Page")
		.setStyle("PRIMARY")
		.setDisabled();

	let button: MessageButton[] = [];
	button[0] = index == 0 ? prevButtonDisabled : prevButton;
	button[1] = index == pages.length - 1 ? nextButtonDisabled : nextButton;
	return new MessageActionRow().addComponents(button);
}
