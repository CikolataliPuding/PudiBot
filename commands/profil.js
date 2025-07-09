const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'profil',
    description: 'Kullanıcının profil fotoğrafı, bannerı, adı, IDsi, hesap oluşturma ve sunucuya katılma tarihini gösterir',
    usage: '!profil [@kullanıcı]',
    async execute(message, args) {
        if (!message.guild) return;

        // Kullanıcıyı belirle
        let targetUser = message.mentions.users.first() || message.author;
        let member = message.guild.members.cache.get(targetUser.id);

        if (!member) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanıcı Bulunamadı')
                .setDescription('Belirtilen kullanıcı bu sunucuda bulunamadı!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Banner'ı çek
        let bannerURL = null;
        try {
            const user = await message.client.users.fetch(targetUser.id, { force: true });
            if (user.banner) {
                bannerURL = user.bannerURL({ dynamic: true, size: 1024 });
            }
        } catch (e) {
            // banner alınamazsa sorun yok
        }

        // Embed oluştur
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`👤 ${targetUser.username} Profili`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Kullanıcı', value: `${targetUser.tag}`, inline: true },
                { name: 'ID', value: `${targetUser.id}`, inline: true },
                { name: 'Hesap Oluşturma', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: true },
                { name: 'Sunucuya Katılma', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true }
            )
            .setFooter({ text: 'PudiBot Profil Sistemi' })
            .setTimestamp();

        if (bannerURL) {
            embed.setImage(bannerURL);
        }

        await message.reply({ embeds: [embed] });
    }
}; 