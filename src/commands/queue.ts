import { Player, Queue } from "discord-player";
import { EmbedFieldData, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

export async function queue(message: Message, player: Player) {
    const thisIndex = new Index();
    thisIndex.index = 0;
    const serverQueue = player.getQueue(message.guildId);
    if (!serverQueue || !serverQueue.playing) return message.channel.send("No music is being played");

    // * Config Variable
    const amountInPage = 15;
    const pages: MessageEmbed[] = createPages(serverQueue, amountInPage, message, player);
    const collector = message.channel.createMessageComponentCollector({ time: 60000 });

    const testButton = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("prev")
                .setLabel("Prev Page")
                .setStyle("PRIMARY"),
            new MessageButton()
                .setCustomId("next")
                .setLabel("Next Page")
                .setStyle("PRIMARY"));

    message.channel.send({ embeds: [pages[thisIndex.index]], components: [testButton] });
    collector.on("collect", async i => {
        if (i.customId === "prev") {
            thisIndex.index = thisIndex.index - 1;
            if (thisIndex.index < 0) thisIndex.index = pages.length - 1;
            await i.update({ embeds: [pages[thisIndex.index]], });
        }
        if (i.customId === "next") {
            thisIndex.index = thisIndex.index + 1;
            if (thisIndex.index >= pages.length) thisIndex.index = 0;
            await i.update({ embeds: [pages[thisIndex.index]], });
        }
    });
}


function getValue(pageCount: number, serverQueue: Queue) {
    const values: string[] = [];
    let value = "";
    for (let i = 0; i <= serverQueue.tracks.length; i++) {
        if (i % pageCount === 0 && i !== 0 || i === serverQueue.tracks.length) { values.push(value); value = ""; }
        if (i !== serverQueue.tracks.length) value += `${i + 1}. ${serverQueue.tracks[i].title}\n`;
    }
    return values;
}

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

function createEmbeddedMessage(name: string, value: string, message: Message, player: Player) {
    return new MessageEmbed()
        .setColor("#CBC3E3")
        .setTitle("Current Queue")
        .setDescription(`Now playing: ${player.getQueue(message.guild).nowPlaying()}`)
        .addField(name, value)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL());
}

function Index() {
    let index = null;
    Object.defineProperty(this, "index", {
        get() { return index; },
        set(value) { index = value; }
    });
}
