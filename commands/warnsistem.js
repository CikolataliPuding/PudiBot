const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'warnsistem',
    description: 'Uyarı sistemiyle ilgili tüm komutları ve açıklamalarını listeler.',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('⚠️ Uyarı Sistemi Komutları')
            .setDescription('Sunucudaki uyarı sistemiyle ilgili kullanabileceğiniz komutlar:')
            .addFields(
                { name: '!warn @kullanıcı [sebep]', value: 'Bir kullanıcıya uyarı verir.', inline: false },
                { name: '!unwarn @kullanıcı', value: 'Bir kullanıcının uyarısını kaldırır.', inline: false },
                { name: '!warnlog #kanal', value: 'Uyarı loglarının gönderileceği kanalı ayarlar.', inline: false },
                { name: '!warnsistem', value: 'Uyarı sistemiyle ilgili komutları listeler.', inline: false }
            )
            .setFooter({ text: `${message.guild.name} • Uyarı Sistemi Yardım`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
}; 