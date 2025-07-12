const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'profil',
    description: 'Kullanıcının profil fotoğrafı, bannerı, adı, IDsi, hesap oluşturma ve sunucuya katılma tarihini gösterir',
    usage: '!profil [@kullanıcı/ID]',
    async execute(message, args) {
        if (!message.guild) return;

        // Kullanıcıyı belirle
        let targetUser = null;
        let member = null;

        if (args.length > 0) {
            // Mention kontrolü
            const mentionedUser = message.mentions.users.first();
            if (mentionedUser) {
                targetUser = mentionedUser;
                member = message.guild.members.cache.get(targetUser.id);
            } else {
                // ID kontrolü
                const userId = args[0];
                if (/^\d{17,19}$/.test(userId)) { // Discord ID formatı kontrolü
                    try {
                        targetUser = await message.client.users.fetch(userId);
                        member = message.guild.members.cache.get(userId);
                        
                        // Eğer kullanıcı sunucuda yoksa, sadece genel bilgileri göster
                        if (!member) {
                            const embed = new EmbedBuilder()
                                .setColor('#FFA500')
                                .setTitle(`👤 ${targetUser.username} Profili`)
                                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                                .addFields(
                                    { name: 'Kullanıcı', value: `${targetUser.tag}`, inline: true },
                                    { name: 'ID', value: `${targetUser.id}`, inline: true },
                                    { name: 'Hesap Oluşturma', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: true },
                                    { name: 'Sunucu Durumu', value: '❌ Bu kullanıcı bu sunucuda değil', inline: true }
                                )
                                .setFooter({ text: 'PudiBot Profil Sistemi • Sunucu Dışı Kullanıcı', iconURL: message.guild.iconURL({ dynamic: true }) })
                                .setTimestamp();

                            // Banner'ı çek
                            let bannerURL = null;
                            try {
                                if (targetUser.banner) {
                                    bannerURL = targetUser.bannerURL({ dynamic: true, size: 1024 });
                                }
                            } catch (e) {
                                // banner alınamazsa sorun yok
                            }

                            if (bannerURL) {
                                embed.setImage(bannerURL);
                            }

                            return message.reply({ embeds: [embed] });
                        }
                    } catch (error) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ Kullanıcı Bulunamadı')
                            .setDescription('Belirtilen ID ile kullanıcı bulunamadı!')
                            .addFields(
                                { name: 'Girilen ID', value: userId, inline: true },
                                { name: 'Hata', value: 'Kullanıcı Discord\'da mevcut değil veya bot erişim izni yok', inline: true }
                            )
                            .setFooter({ text: 'PudiBot Profil Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                            .setTimestamp();
                        return message.reply({ embeds: [errorEmbed] });
                    }
                } else {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Geçersiz Format')
                        .setDescription('Lütfen geçerli bir kullanıcı ID\'si girin!')
                        .addFields(
                            { name: 'Kullanım', value: '`!profil @kullanıcı` veya `!profil <ID>`', inline: true },
                            { name: 'Örnek', value: '`!profil 123456789012345678`', inline: true }
                        )
                        .setFooter({ text: 'PudiBot Profil Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                        .setTimestamp();
                    return message.reply({ embeds: [errorEmbed] });
                }
            }
        } else {
            // Hiçbir argüman verilmemişse, komutu kullanan kişinin profilini göster
            targetUser = message.author;
            member = message.guild.members.cache.get(targetUser.id);
        }

        if (!member) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanıcı Bulunamadı')
                .setDescription('Belirtilen kullanıcı bu sunucuda bulunamadı!')
                .setFooter({ text: 'PudiBot Profil Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
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
            .setFooter({ text: 'PudiBot Profil Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        if (bannerURL) {
            embed.setImage(bannerURL);
        }

        await message.reply({ embeds: [embed] });
    }
}; 