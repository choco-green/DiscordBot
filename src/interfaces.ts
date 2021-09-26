export interface Song {
    title: string;
    url: string;
}

export interface ServerQueue {
    songs: {
        title: string;
        url: string;
    }[];
}