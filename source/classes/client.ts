import Voice from '@discordjs/voice';
import Discord from 'discord.js';
import Command from './command';
import Path from 'node:path';
import Fs from 'node:fs';

type Dispatcher = {
    status : "playing" | "paused" | "stopped",
    connection: Voice.VoiceConnection,
    player: Voice.AudioPlayer,
    queue: Video[],
}

export default class Client extends Discord.Client {

    public dispatcher: { [key: string]: Dispatcher } = {};
    public commands: Command[] = [];

    constructor() {
        super({
            intents: [
                Discord.GatewayIntentBits.Guilds,
                Discord.GatewayIntentBits.GuildMembers,
                Discord.GatewayIntentBits.GuildMessages,
                Discord.GatewayIntentBits.MessageContent,
                Discord.GatewayIntentBits.GuildVoiceStates,
            ]
        });
        this.init();
    }

    private async init() {
        await this.login(process.env.DISCORD_TOKEN);
        await this.load_commands();
        await this.register_commands();
        await this.register_events();
    }

    private async register_events() {
        this.on('ready', _ => console.log(`Logged in as ${this.user!.tag}!`));
        this.on('interactionCreate', interaction => {
            if(interaction instanceof Discord.CommandInteraction)
                if(this.commands.find(c => c.data.name === interaction.commandName))
                    this.commands.find(c => c.data.name === interaction.commandName)!.execute(interaction);
        })
    }

    private async load_commands() {
        const commands_folder = Path.resolve(__dirname, '..', 'commands');
        const command_files = Fs.readdirSync(commands_folder);

        for (let file of command_files) {
            let command_class = await import(Path.resolve(commands_folder, file));
            let command = new command_class.default(this);
            this.commands.push(command);
        }
    }

    private async register_commands() {
        this.application.commands.set(this.commands.map(command => command.data));
    }

}