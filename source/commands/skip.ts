import Command from "../classes/command";
import Discord from 'discord.js';

export default class SkipCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'skip',
            description: 'Skip the current audio',
        })
    }

    public async execute(interaction) {
        if (!(interaction.guild instanceof Discord.Guild)) return;
        if (!this.client.dispatcher[interaction.guildId!] || this.client.dispatcher[interaction.guildId!].queue.length == 0) 
            return interaction.reply({ content: ":warning: **Nothing Playing!**" });
        this.client.dispatcher[interaction.guildId!].player.stop();
        interaction.reply({ content: ":fast_forward: **Skipped!**" });
    }
}