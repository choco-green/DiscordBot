import { Player } from "discord-player";
import { VoiceState } from "discord.js";

export function stateCheckingForBot(member: VoiceState, player: Player) {
    if (!member.channel) return; // The member is not in a voice channel
    if (!member.guild.me.voice.channel) return; // The bot is not in a voice channel
    if (!(member.guild.me.voice.channel.id === member.channel.id)) return; // The member is not in the same voice channel as the bot
    if (member.channel.members.size <= 1) return player.getQueue(member.guild).destroy(); // Disconnects the bot because the all other user left
}