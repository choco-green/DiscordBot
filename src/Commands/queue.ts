import { Player, Queue } from "discord-player";
import { EmbedFieldData, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

export async function queue(message: Message, player: Player) {
    const serverQueue = player.getQueue(message.guildId);
    if (!serverQueue || !serverQueue.playing) return message.channel.send("No music is being played");

    const Index = new index(); // Index for pagination
    const amountInPage = 15; // Amount of songs displayed on one page
    const pages: MessageEmbed[] = createPages(serverQueue, amountInPage, message, player); // The list of pages that will be displayed
    const collector = message.channel.createMessageComponentCollector({ time: 60000 }); // Collector for user interation

    // Handling User's interation with the button in Queue
    collector.on("collect", async i => {
        if (i.customId === "prev") {
            Index.index = (Index.index-- < 0) ? 0 : Index.index--;
            await i.update({ embeds: [pages[Index.index]], components: [buttons(Index.index, pages)] });
        }
        if (i.customId === "next") {
            Index.index = (Index.index++ > pages.length - 1) ? pages.length - 1 : Index.index++;
            await i.update({ embeds: [pages[Index.index]], components: [buttons(Index.index, pages)] });
        }
    });

    // Initial message sent to user
    message.channel.send({ embeds: [pages[Index.index]], components: [buttons(Index.index, pages)] });
}

// A function that gets "amountInPage" amount of titles of the track and concat them into a single string
// This is used in the function "createPages" to make pages
function getValue(pageCount: number, serverQueue: Queue) {
    const values: string[] = [];
    let value = "";
    for (let i = 0; i <= serverQueue.tracks.length; i++) {
        if (i % pageCount === 0 && i !== 0 || i === serverQueue.tracks.length) { values.push(value); value = ""; }
        if (i !== serverQueue.tracks.length) value += `${i + 1}. ${serverQueue.tracks[i].title}\n`;
    }
    return values;
}

// Receives values from "getValue" and creates embedded messages which is then put into a page array
function createPages(serverQueue: Queue, pageCount: number, message: Message, player: Player) {
    const pages: MessageEmbed[] = [];
    const Values = getValue(pageCount, serverQueue);
    const fields: EmbedFieldData[] = [];
    for (let i = 0; i < Values.length; i++) fields.push({ name: `Page ${i + 1}`, value: Values[i] });
    fields.forEach(field => {
        pages.push(createEmbeddedMessage(field.name, field.value, message, player));
    });
    return pages;
}

// Creates embedded messages based on each indivisual page
function createEmbeddedMessage(name: string, value: string, message: Message, player: Player) {
    return new MessageEmbed()
        .setColor("#CBC3E3")
        .setTitle("Current Queue")
        .setDescription(`Now playing: **${player.getQueue(message.guild).nowPlaying()}**`)
        .addField(name, value)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL());
}

// Indexing for the pages
function index() {
    let index = 0;
    Object.defineProperty(this, "index", {
        get() { return index; },
        set(value) { index = value; }
    });
}

// A function that figures out whether or not the buttons should be enabled or disabled for each page
function buttons(index: number, pages: MessageEmbed[]) {
    // Types of buttons
    const prevButton = new MessageButton().setCustomId("prev").setLabel("Prev Page").setStyle("PRIMARY");
    const nextButton = new MessageButton().setCustomId("next").setLabel("Next Page").setStyle("PRIMARY");
    const prevButtonDisabled = new MessageButton().setCustomId("prev").setLabel("Prev Page").setStyle("PRIMARY").setDisabled();
    const nextButtonDisabled = new MessageButton().setCustomId("next").setLabel("Next Page").setStyle("PRIMARY").setDisabled();

    let button: MessageButton[] = [];
    button[0] = (index == 0) ? prevButtonDisabled : prevButton;
    button[1] = (index == pages.length - 1) ? nextButtonDisabled : nextButton;
    return new MessageActionRow().addComponents(button);
}