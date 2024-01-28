import { createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import fetch_video from "../scripts/fetch_video";
import Command from "../classes/command";
import Client from "../classes/client";
import Discord from 'discord.js';
import YTDL from 'ytdl-core';
import Path from 'node:path';
import Fs from 'node:fs';

export default class PlayCommand extends Command {

    constructor(client: Client) {
        super(client,
            {
                name: "play",
                description: "Play audio from youtube video!",
                type: Discord.ApplicationCommandType.ChatInput,
                options: [
                    { name: "query", description: "Youtube video url / title", type: Discord.ApplicationCommandOptionType.String, required: true }
                ]
            }
        );
    }

    public async execute(interaction: Discord.CommandInteraction) {

        if (!(interaction.guild instanceof Discord.Guild)) return;
        if (!(interaction.member instanceof Discord.GuildMember)) return;
        if (!interaction.options.get("query")) return;

        if (!this.client.dispatcher[interaction.guildId!]) this.client.dispatcher[interaction.guildId!] = {
            connection: null as any,
            player: null as any,
            status: "stopped",
            queue: [],
        };

        var dispatcher = this.client.dispatcher[interaction.guildId!];

        let result = await fetch_video(interaction.options.get("query")!.value as string);

        if ('videos' in result) {
            let playlist = result as Playlist
            interaction.reply({ content: `:notes: **Playlist Added**: [${playlist.title}](${playlist.url})` })
            dispatcher.queue.push(...playlist.videos)
        };

        if (!('videos' in result)) {
            let video = result as Video
            interaction.reply({ content: `:notes: **Song Added**: [${video.title}](${video.url})` })
            dispatcher.queue.push(video)
        }

        if (result == null)
            interaction.reply({ content: `:warning: **Not Found!**` })

        if (!dispatcher.connection) dispatcher.connection =
            joinVoiceChannel({
                adapterCreator: interaction.guild!.voiceAdapterCreator,
                channelId: interaction.member.voice.channelId!,
                guildId: interaction.guildId!,
            })

        if (!dispatcher.player && dispatcher.queue.length > 0)
            this.play(interaction);
    }

    private play(interaction: Discord.CommandInteraction) {
        let i = 0;
        let disaptcher = this.client.dispatcher[interaction.guildId!];
        disaptcher.player = createAudioPlayer();
        disaptcher.connection.subscribe(disaptcher.player);

        YTDL(disaptcher.queue[0].url, { filter: 'audioonly' })
            .pipe(Fs.createWriteStream(Path.resolve(__dirname, '..', 'temp', interaction.guildId! + '.mp3')))
            .on("drain", () => {
                if (disaptcher.status == "playing") return
                if (i < 10) return i++;
                let file_path = Path.resolve(__dirname, '..', 'temp', interaction.guildId! + '.mp3');
                let resource = createAudioResource(file_path);
                disaptcher.player.play(resource);
                disaptcher.status = "playing";
            })

        disaptcher.player.on("stateChange", (oldState, newState) => {
            if (newState.status == "idle") {
                disaptcher.queue.shift();
                disaptcher.status = "stopped";
                if (disaptcher.queue.length > 0)
                    this.play(interaction);
                else this.client.dispatcher[interaction.guildId!] = {
                    status: "stopped",
                    connection: null,
                    player: null,
                    queue: [],
                }
            }
        })
    }
}
