const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bansistem',
    description: 'Ban sistemiyle ilgili tüm komutları ve açıklamalarını listeler.',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor('#C0392B')
            .setTitle('⛔ Ban Sistemi Komutları')
            .setDescription('Sunucudaki ban sistemiyle ilgili kullanabileceğiniz komutlar:')
            .addFields(
                { name: '!ban @kullanıcı [sebep]', value: 'Bir kullanıcıyı sunucudan yasaklar.', inline: false },
                { name: '!unban kullanıcıID', value: 'Yasaklı bir kullanıcının banını kaldırır.', inline: false },
                { name: '!banlog #kanal', value: 'Ban loglarının gönderileceği kanalı ayarlar.', inline: false },
                { name: '!bansistem', value: 'Ban sistemiyle ilgili komutları listeler.', inline: false }
            )
            .setFooter({ text: `${message.guild.name} • Ban Sistemi Yardım`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
}; 