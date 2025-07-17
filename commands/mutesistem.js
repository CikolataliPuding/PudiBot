const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'mutesistem',
    description: 'Mute sistemiyle ilgili tüm komutları ve açıklamalarını listeler.',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor('#E67E22')
            .setTitle('🔇 Mute Sistemi Komutları')
            .setDescription('Sunucudaki mute sistemiyle ilgili kullanabileceğiniz komutlar:')
            .addFields(
                { name: '!mute @kullanıcı [süre] [sebep]', value: 'Bir kullanıcıyı belirli bir süreliğine susturur.', inline: false },
                { name: '!unmute @kullanıcı', value: 'Susturulmuş bir kullanıcının mutesini kaldırır.', inline: false },
                { name: '!mutelog #kanal', value: 'Mute loglarının gönderileceği kanalı ayarlar.', inline: false },
                { name: '!mutesistem', value: 'Mute sistemiyle ilgili komutları listeler.', inline: false }
            )
            .setFooter({ text: `${message.guild.name} • Mute Sistemi Yardım`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
}; 