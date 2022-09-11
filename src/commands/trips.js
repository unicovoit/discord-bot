import discord_js from "discord.js";
const {SlashCommandBuilder, EmbedBuilder} = discord_js;
import axios from 'axios';

const getTrips = async () => {
    const response = await axios.get('https://unicovoit.fr/api/v1/trips');
    return response.data;
}


export const data = new SlashCommandBuilder()
    .setName('trips')
    .setDescription('Afficher tous les trajets disponibles')

export async function execute(interaction) {
    const trips = await getTrips();
    let msg;
    if (trips.length === 0) {
        msg = new EmbedBuilder()
            .setTitle('Aucun trajet disponible')
            .setDescription('Il n\'y a aucun trajet disponible pour le moment.')
            .setColor('#ff0000')
            .setTimestamp()
            .setFooter({text: 'Unicovoit', iconURL: 'https://unicovoit.fr/icon.png'})
            .setURL('https://unicovoit.fr/trips')
    } else {
        const tripsToDisplay = trips.slice(0, 10);
        msg = new EmbedBuilder()
            .setTitle('Trajets disponibles')
            .setDescription('Voici les 10 prochains trajets disponibles.')
            .setColor('#4a6dd9')
            .setTimestamp()
            .setFooter({text: 'Unicovoit', iconURL: 'https://unicovoit.fr/icon.png'})
            .setURL('https://unicovoit.fr/trips')
        for (const trip of tripsToDisplay) {
            const date = new Date(trip.departure_time);
            const departureTime = date.toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
            msg.addFields({name: `${trip.fromCity} -> ${trip.toCity}`, value: `${departureTime}\n${trip.price} €`, inline: false})
        }
    }

    return interaction.reply({embeds: [msg]});
}
