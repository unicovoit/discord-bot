import discord_js from "discord.js";
const {SlashCommandBuilder, EmbedBuilder} = discord_js;
import axios from 'axios';

const getTrips = async (fromCity, toCity, date) => {
    if (/^[a-zA-ZäöüßÄÖÜ éèàù-]+$/.test(fromCity) && /^[a-zA-ZäöüßÄÖÜ éèàù-]+$/.test(toCity) && /^\d\d\/\d\d\/\d\d\d\d$/.test(date)) {
        const from = await axios.get(`https://addok.unicovoit.fr/search?q=${fromCity}`);
        const to = await axios.get(`https://addok.unicovoit.fr/search?q=${toCity}`);

        let coords = {
            from: from.data.features[0].geometry.coordinates.join(','),
            to: to.data.features[0].geometry.coordinates.join(',')
        }
        date = date.split('/').reverse().join('-');
        let url = `https://unicovoit.fr/api/v1/trips?from=${coords.from}&to=${coords.to}&date=${date}`;
        const response = await axios.get(url);

        return response.data;
    }
    return [];
}


export const data = new SlashCommandBuilder()
    .setName('search')
    .setDescription('Rechercher un trajet sur UniCovoit')
    .addStringOption(option => option.setName('from').setDescription('Ville de départ').setRequired(true))
    .addStringOption(option => option.setName('to').setDescription('Ville d\'arrivée').setRequired(true))
    .addStringOption(option => option.setName('date').setDescription('Date de départ (au format jj/mm/aaaa)').setRequired(true))

export async function execute(interaction) {
    const fromCity = interaction.options.getString('from');
    const toCity = interaction.options.getString('to');
    const date = interaction.options.getString('date');
    const trips = await getTrips(fromCity, toCity, date);

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
            .setDescription('Voici les 10 premiers trajets correspondant à votre recherche.')
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
