const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'temizlesistem',
    description: 'Temizleme/mesaj silme sistemiyle ilgili tüm komutları ve açıklamalarını listeler.',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor('#16A085')
            .setTitle('🧹 Temizleme Sistemi Komutları')
            .setDescription('Sunucudaki mesaj temizleme sistemiyle ilgili kullanabileceğiniz komutlar:')
            .addFields(
                { name: '!temizle [sayı]', value: 'Belirtilen sayıda mesajı siler.', inline: false },
                { name: '!temizlesistem', value: 'Temizleme sistemiyle ilgili komutları listeler.', inline: false }
            )
            .setFooter({ text: `${message.guild.name} • Temizleme Sistemi Yardım`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
}; 