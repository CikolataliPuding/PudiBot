const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { setLogChannel, addMessageLogExempt, removeMessageLogExempt, getMessageLogExempt } = require('../utils/database');

module.exports = {
    name: 'mesajlog',
    description: 'Mesaj log kanalını ve muaf kanalları ayarlar',
    usage: '!mesajlog <ayarla|muaf-ekle|muaf-kaldir|muaf-listesi> [#kanal]',
    async execute(message, args) {
        // Yetki kontrolü
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Yetki Hatası')
                .setDescription('Bu komutu kullanmak için **Yönetici** yetkiniz yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Argüman kontrolü
        if (args.length < 1) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanım Hatası')
                .setDescription('Doğru kullanım: `!mesajlog <ayarla|muaf-ekle|muaf-kaldir|muaf-listesi> [#kanal]`')
                .addFields(
                    { name: 'Komutlar', value: '`ayarla` - Mesaj log kanalını ayarla\n`muaf-ekle` - Kanalı muaf listesine ekle\n`muaf-kaldir` - Kanalı muaf listesinden kaldır\n`muaf-listesi` - Muaf kanalları listele', inline: false }
                )
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        const action = args[0].toLowerCase();

        try {
            switch (action) {
                case 'ayarla':
                    if (args.length < 2) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ Kullanım Hatası')
                            .setDescription('Doğru kullanım: `!mesajlog ayarla #kanal`')
                            .setTimestamp();
                        return message.reply({ embeds: [errorEmbed] });
                    }

                    const channel = message.mentions.channels.first();
                    if (!channel) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ Kanal Bulunamadı')
                            .setDescription('Lütfen bir kanal etiketleyin!')
                            .setTimestamp();
                        return message.reply({ embeds: [errorEmbed] });
                    }

                    const success = await setLogChannel(message.guild.id, 'message', channel.id);
                    if (!success) {
                        throw new Error('Log kanalı veritabanına kaydedilemedi');
                    }

                    const successEmbed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('✅ Mesaj Log Kanalı Ayarlandı')
                        .addFields(
                            { name: '📺 Kanal', value: `${channel}`, inline: true }
                        )
                        .setTimestamp();

                    await message.reply({ embeds: [successEmbed] });
                    break;

                case 'muaf-ekle':
                    if (args.length < 2) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ Kullanım Hatası')
                            .setDescription('Doğru kullanım: `!mesajlog muaf-ekle #kanal`')
                            .setTimestamp();
                        return message.reply({ embeds: [errorEmbed] });
                    }

                    const exemptChannel = message.mentions.channels.first();
                    if (!exemptChannel) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ Kanal Bulunamadı')
                            .setDescription('Lütfen bir kanal etiketleyin!')
                            .setTimestamp();
                        return message.reply({ embeds: [errorEmbed] });
                    }

                    const exemptChannels = await getMessageLogExempt(message.guild.id);
                    
                    if (!exemptChannels.includes(exemptChannel.id)) {
                        const addSuccess = await addMessageLogExempt(message.guild.id, exemptChannel.id);
                        if (!addSuccess) {
                            throw new Error('Kanal muaf listesine eklenemedi');
                        }

                        const successEmbed = new EmbedBuilder()
                            .setColor('#00ff00')
                            .setTitle('✅ Kanal Muaf Listesine Eklendi')
                            .addFields(
                                { name: '📺 Kanal', value: `${exemptChannel}`, inline: true }
                            )
                            .setTimestamp();

                        await message.reply({ embeds: [successEmbed] });
                    } else {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ff9900')
                            .setTitle('⚠️ Kanal Zaten Muaf')
                            .setDescription('Bu kanal zaten muaf listesinde!')
                            .setTimestamp();
                        await message.reply({ embeds: [errorEmbed] });
                    }
                    break;

                case 'muaf-kaldir':
                    if (args.length < 2) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ Kullanım Hatası')
                            .setDescription('Doğru kullanım: `!mesajlog muaf-kaldir #kanal`')
                            .setTimestamp();
                        return message.reply({ embeds: [errorEmbed] });
                    }

                    const removeChannel = message.mentions.channels.first();
                    if (!removeChannel) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ Kanal Bulunamadı')
                            .setDescription('Lütfen bir kanal etiketleyin!')
                            .setTimestamp();
                        return message.reply({ embeds: [errorEmbed] });
                    }

                    const removeExemptChannels = await getMessageLogExempt(message.guild.id);
                    if (removeExemptChannels.includes(removeChannel.id)) {
                        const removeSuccess = await removeMessageLogExempt(message.guild.id, removeChannel.id);
                        if (!removeSuccess) {
                            throw new Error('Kanal muaf listesinden kaldırılamadı');
                        }

                        const successEmbed = new EmbedBuilder()
                            .setColor('#00ff00')
                            .setTitle('✅ Kanal Muaf Listesinden Kaldırıldı')
                            .addFields(
                                { name: '📺 Kanal', value: `${removeChannel}`, inline: true }
                            )
                            .setTimestamp();

                        await message.reply({ embeds: [successEmbed] });
                    } else {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ff9900')
                            .setTitle('⚠️ Kanal Muaf Değil')
                            .setDescription('Bu kanal muaf listesinde değil!')
                            .setTimestamp();
                        await message.reply({ embeds: [errorEmbed] });
                    }
                    break;

                case 'muaf-listesi':
                    const listExemptChannels = await getMessageLogExempt(message.guild.id);

                    if (listExemptChannels.length === 0) {
                        const noExemptEmbed = new EmbedBuilder()
                            .setColor('#0099ff')
                            .setTitle('📋 Muaf Kanal Listesi')
                            .setDescription('Bu sunucuda muaf kanal bulunmuyor.')
                            .setTimestamp();
                        await message.reply({ embeds: [noExemptEmbed] });
                    } else {
                        const channelList = listExemptChannels.map(channelId => {
                            const channel = message.guild.channels.cache.get(channelId);
                            return channel ? `${channel} (${channelId})` : `Bilinmeyen Kanal (${channelId})`;
                        }).join('\n');

                        const listEmbed = new EmbedBuilder()
                            .setColor('#0099ff')
                            .setTitle('📋 Muaf Kanal Listesi')
                            .setDescription(channelList)
                            .setFooter({ text: `Toplam: ${listExemptChannels.length} kanal` })
                            .setTimestamp();

                        await message.reply({ embeds: [listEmbed] });
                    }
                    break;

                default:
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Geçersiz Komut')
                        .setDescription('Geçerli komutlar: `ayarla`, `muaf-ekle`, `muaf-kaldir`, `muaf-listesi`')
                        .setTimestamp();
                    await message.reply({ embeds: [errorEmbed] });
                    break;
            }
        } catch (error) {
            console.error('Mesaj log hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Mesaj Log Hatası')
                .setDescription('İşlem sırasında bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 