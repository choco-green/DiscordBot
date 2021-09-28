import { Player, QueryType, Track } from "discord-player";
import { Message, MessageEmbed } from "discord.js";

export async function play(message: Message, player: Player) {
    try {
        // Checking conditions
        if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to play music!");
        if (!message.member.voice.channel.permissionsFor(message.client.user).has("CONNECT")) return message.channel.send("I need the permission to be able to join your voice channel!");
        if (!message.member.voice.channel.permissionsFor(message.client.user).has("SPEAK")) return message.channel.send("I need the permission for speaking in your voice channel!");

        // Splices message to remove the ({prefix}play )
        const query = message.content.slice(6);
        const searchResult = await player.search(query, { requestedBy: message.member.user, searchEngine: QueryType.AUTO });
        const queue = player.createQueue(message.guild, { metadata: message.channel });

        if (!searchResult || !searchResult.tracks.length) return message.channel.send("No results were found!");

        // tries to connect to user's channel
        if (!queue.connection) await queue.connect(message.member.voice.channel).catch((err) => {
            player.deleteQueue(message.guildId);
            message.channel.send("I can't join your channel for some reason, please either make sure I have the correct permission or try again later");
            console.error(err);
        });

        if (message.member.voice.channelId && message.member.voice.channelId !== message.guild.me.voice.channelId) return message.channel.send("You can only play songs you are in the same voice channel as the bot");

        // Adds all tracks in playlist / adds track and then plays it if it isn't already playing
        // TODO: known bug: only adds returns 100 tracks
        if (searchResult.playlist) {
            queue.addTracks(searchResult.tracks);
            if (!queue.playing) await queue.play();
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor("#CBC3E3")
                        .setTitle(`Playlist Added: **${searchResult.playlist.title}**`)
                        .setURL(searchResult.playlist.url)
                        .setAuthor(searchResult.playlist.author.name, "", searchResult.playlist.author.url)
                        .setDescription(searchResult.playlist.description)
                        .setThumbnail(searchResult.playlist.thumbnail)
                        .addField("Playlist Length", formatTime(searchResult.tracks))
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
                        .setColor("#CBC3E3")
                        .setTitle(`Song Added: **${searchResult.tracks[0].title}**`)
                        .setURL(searchResult.tracks[0].url)
                        .setAuthor(searchResult.tracks[0].author, "", searchResult.tracks[0].url)
                        .addField("Track Length", searchResult.tracks[0].duration)
                        .setImage(searchResult.tracks[0].thumbnail)
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

// Helper function
// Formats the total playlist time into hours, minutes, seconds
function formatTime(tracks: Track[]) {
    let playlistLength = 0;
    let i = 0;
    tracks.forEach(track => { playlistLength += track.durationMS; i++ });
    console.log(i);
    if (playlistLength < 3600) return new Date(playlistLength).toISOString().substr(14, 5);
    return new Date(playlistLength).toISOString().substr(11, 8);

}
