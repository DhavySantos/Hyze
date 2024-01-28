import search, { OptionsWithSearch } from "yt-search";

const playlistRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:playlist(?:s)?)\/|\S*?[?&]list=)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
const videoRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;


export default async function fetch(query: string): Promise<Video | Playlist | null> {

    if (query.match(playlistRegex)) return await fetch_playlist(query.match(playlistRegex)[1]);
    else if (query.match(videoRegex)) return await fetch_video(query.match(videoRegex)[1]);
    else return await fetch_query(query);
}

async function fetch_query(query: string): Promise<Video> {
    let result = await search({ query, category: 'music', gl: "BR", pages: 1 });
    if (!result) return null;
    return {
        duration: result.videos[0].duration.seconds,
        title: result.videos[0].title,
        url: result.videos[0].url,
    }
}

async function fetch_video(id: string): Promise<Video> {
    let result = await search({ videoId: id });
    if (!result) return null;
    return {
        duration: result.duration.seconds,
        title: result.title,
        url: result.url,
    }
}

async function fetch_playlist(id: string): Promise<Playlist> {
    let result = await search({ listId: id });
    if (!result) null;
    let videos = result.videos.map(video => {
        return {
            duration: video.duration.seconds,
            title: video.title,
            url: 'https://www.youtube.com/watch?v=' + video.videoId,
        }
    })
    return { videos, url: result.url, title: result.title };
}