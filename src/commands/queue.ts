import { Player, Queue } from "discord-player";
import { EmbedFieldData, Message, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { Pagination } from "discordjs-button-embed-pagination";

export async function queue(message: Message, player: Player) {
    const queue = player.getQueue(message.guildId);
    if (!queue || !queue.playing) return message.channel.send("No music is being played");

    //for (let i = 0; i < queue.tracks.length; i++) { message.channel.send(`${i + 1}. **${queue.tracks[i]}**`); }

    // TODO: discord card style, rather than for loop

    const amountInPage = 10;
    const pages: MessageEmbed[] = pagesCalculation(queue, amountInPage, message);
    await new Pagination(message.channel as TextChannel, pages, "Page").paginate();
}

function pagesCalculation(queue: Queue, amountInPage: number, message: Message) {
    const amountOfPagesNeeded = Math.ceil(queue.tracks.length / amountInPage);
    // todo: add maths modular to calculate for amount in page to reduce error in line 26
    let pages: MessageEmbed[] = [];
    let field: EmbedFieldData[] = [];
    for (let i = 0; i < amountOfPagesNeeded; i++) {
        for (let j = 0; j < amountInPage; j++) {
            try {
                const f: EmbedFieldData = { name: `**${j + i * amountInPage + 1}.** `, value: queue.tracks[j + i * amountInPage].title };
                field[j] = f;
            } catch (err) {
                console.error(err);
            }
        }

        pages[i] = new MessageEmbed()
            .setColor("#CBC3E3")
            .setTitle("Current Queue")
            .addFields(field)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL());
    }
    return pages;
}
