const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'levelsistem',
    aliases: ['xpsistem'],
    description: 'Level/XP sistemiyle ilgili tüm komutları ve açıklamalarını listeler.',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor('#6A5ACD')
            .setTitle('📈 Level/XP Sistemi Komutları')
            .setDescription(`Sunucudaki seviye ve XP sistemiyle ilgili kullanabileceğiniz komutlar:`)
            .addFields(
                { name: '!level', value: 'Kendi seviyeni ve XP bilgisini gösterir.', inline: false },
                { name: '!leaderboard', value: 'Sunucudaki en yüksek seviyeye sahip ilk 10 kişiyi ve kendi sıranı gösterir.', inline: false },
                { name: '!xplog #kanal / anlık', value: 'Level up mesajlarının gönderileceği kanalı ayarlar.', inline: false },
                { name: '!levelsistem / !xpsistem', value: 'Level/XP sistemiyle ilgili komutları listeler.', inline: false }
            )
            .setFooter({ text: `${message.guild.name} • Level Sistemi Yardım`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
}; 