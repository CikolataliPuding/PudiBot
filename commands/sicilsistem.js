const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sicilsistem',
    description: 'Sicil/ceza geçmişi sistemiyle ilgili tüm komutları ve açıklamalarını listeler.',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor('#8E44AD')
            .setTitle('📜 Sicil Sistemi Komutları')
            .setDescription('Sunucudaki sicil/ceza geçmişi sistemiyle ilgili kullanabileceğiniz komutlar:')
            .addFields(
                { name: '!sicil @kullanıcı', value: 'Bir kullanıcının ceza geçmişini gösterir.', inline: false },
                { name: '!sicilsistem', value: 'Sicil sistemiyle ilgili komutları listeler.', inline: false }
            )
            .setFooter({ text: `${message.guild.name} • Sicil Sistemi Yardım`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
}; 