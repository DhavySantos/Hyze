import Client from "./client";
import Discord from 'discord.js';
export default class Command {

    public data: Discord.ApplicationCommandData;
    public client: Client;

    constructor(client: Client, data: Discord.ApplicationCommandData) {
        this.client = client;
        this.data = data;
    }

    public async execute(interaction: Discord.CommandInteraction) {
    }
}