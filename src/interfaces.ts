export interface Song {
    title: string;
    url: string;
}

export interface ServerQueue {
    songs: {
        [key: number]: Song
    }[];
}