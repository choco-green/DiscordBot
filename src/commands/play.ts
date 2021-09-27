import { Player, QueryType } from "discord-player";
import { Message, MessageEmbed } from "discord.js";
import { colour } from "../../config";

export async function play(message: Message, player: Player) {
    try {
        // Checking conditions
        if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to play music!");
        if (!message.member.voice.channel.permissionsFor(message.client.user).has("CONNECT")) return message.channel.send("I need the permission to be able to join your voice channel!");
        if (!message.member.voice.channel.permissionsFor(message.client.user).has("SPEAK")) return message.channel.send("I need the permission for speaking in your voice channel!");

        // Splices message to remove the ({prefix}play )
        const query = message.content.slice(6);
        const searchResult = await player.search(query, { requestedBy: message.member.user, searchEngine: QueryType.AUTO });
        const isPlaylist = !!searchResult.playlist;
        const queue = player.createQueue(message.guild, { metadata: message.channel });

        if (!searchResult || !searchResult.tracks.length) return message.channel.send("No results were found!");

        // tries to connect to user's channel
        if (!queue.connection) await queue.connect(message.member.voice.channel).catch((err) => {
            player.deleteQueue(message.guildId);
            message.channel.send("I can join your channel for some reason, please either make sure I have the correct permission or try again later");
            console.error(err);
        });

        // Adds all tracks in playlist / adds track and then plays it if it isn't already playing
        if (searchResult.playlist) {
            queue.addTracks(searchResult.tracks);
            if (!queue.playing) await queue.play();
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(colour)
                        .setTitle(`Playlist Added: **${searchResult.playlist.title}**`)
                        .setURL(searchResult.playlist.url)
                        .setAuthor(searchResult.playlist.author.name, "", searchResult.playlist.author.url)
                        .setDescription(searchResult.playlist.description)
                        .setThumbnail(searchResult.playlist.thumbnail)
                        .addField("Playlist Length", formatTime(searchResult))
                        .setImage(searchResult.tracks[0].thumbnail)
                        .setImage("https://imgur.com/xKu5k82")
                        .setTimestamp()
                        .setFooter(`Requested by the user ${searchResult.tracks[0].requestedBy.username}`, searchResult.tracks[0].requestedBy.avatarURL())
                ]
            });
        } else {
            queue.addTrack(searchResult.tracks[0]);
            if (!queue.playing) await queue.play();
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(colour)
                        .setTitle(`Song Added: **${searchResult.tracks[0].title}**`)
                        .setURL(searchResult.tracks[0].url)
                        .setAuthor(searchResult.tracks[0].author, "", searchResult.tracks[0].url)
                        .setThumbnail(searchResult.tracks[0].thumbnail)
                        .addField("Track Length", searchResult.tracks[0].duration)
                        .setImage(searchResult.tracks[0].thumbnail)
                        .setImage("https://imgur.com/xKu5k82")
                        .setTimestamp()
                        .setFooter(`Requested by the user ${searchResult.tracks[0].requestedBy.username}`, searchResult.tracks[0].requestedBy.avatarURL())
                ]
            });
        }
    } catch (err) {
        console.error(err);
        message.channel.send("Something is wrong with this track/playlist, please try to play something else");
        message.channel.send(`Here is the error "***${err.message}***"`);
    }
}

// formats the total playlist time into hours, minutes, seconds
function formatTime(searchResult: { tracks: any[]; }) {
    let playlistLength = 0;
    searchResult.tracks.forEach(track => { playlistLength += track.durationMS; });

    const d = Math.round(playlistLength / 1000);
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);

    const hDisplay = h > 0 ? h + ":" : "";
    const mDisplay = m > 0 ? m + ":" : "";
    const sDisplay = s;
    return hDisplay + mDisplay + sDisplay;
}
