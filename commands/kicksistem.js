const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kicksistem',
    description: 'Kick sistemiyle ilgili tüm komutları ve açıklamalarını listeler.',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor('#2980B9')
            .setTitle('👢 Kick Sistemi Komutları')
            .setDescription('Sunucudaki kick sistemiyle ilgili kullanabileceğiniz komutlar:')
            .addFields(
                { name: '!kick @kullanıcı [sebep]', value: 'Bir kullanıcıyı sunucudan atar.', inline: false },
                { name: '!kicksistem', value: 'Kick sistemiyle ilgili komutları listeler.', inline: false }
            )
            .setFooter({ text: `${message.guild.name} • Kick Sistemi Yardım`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
}; 