import format_sconds from "../scripts/format_seconds";
import Command from "../classes/command";
import Discord from 'discord.js';

export default class QueueCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'queue',
            description: 'Show the current queue',
        })
    }

    public async execute(interaction) {
        if (!(interaction.guild instanceof Discord.Guild)) return;
        if (!this.client.dispatcher[interaction.guildId] || this.client.dispatcher[interaction.guildId].queue.length == 0)
            return interaction.reply({ content: ":warning: **Nothing Playing!**" });

        var duration = 0;
        var queue = "";
        var index = 0;
        for (let audio of this.client.dispatcher[interaction.guildId].queue) {
            index++;
            if (index <= 25) {
                let title =
                    audio.title
                        .replace(/[\[\]()]/g, '')
                        .substring(0, 40);
                queue += `${index}º - [${title}](${audio.url}) / ${format_sconds(audio.duration)}\n`;
            }
            duration += audio.duration;
        }
        var embed = new Discord.EmbedBuilder()
            .setDescription(queue)
            .setAuthor({ name: "Current Queue", iconURL: this.client.user.avatarURL() })
            .setFooter({ text: 'Queue Length: ' + index + ' / Duration: ' + format_sconds(duration) });
        interaction.reply({ embeds: [embed] })
    }
}