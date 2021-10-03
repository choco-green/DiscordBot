import { Track } from "discord-player";

// Formats the total playlist time into hours, minutes, seconds
export function formatTime(tracks: Track[]) {
	let playlistLength = 0; // in miliseconds
	tracks.forEach((track) => {
		playlistLength += track.durationMS;
	});
	if (playlistLength < 3600) return new Date(playlistLength).toISOString().substr(14, 5);
	return new Date(playlistLength).toISOString().substr(11, 8);
}
