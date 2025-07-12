const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { setAutoRole, getAutoRole, removeAutoRole } = require('../utils/database');

module.exports = {
    name: 'otorol',
    description: 'Sunucuya giren herkese otomatik rol verme sistemi (sadece yöneticiler).',
    usage: '!otorol ayarla <@rol> | !otorol kaldir | !otorol durum',
    async execute(message, args) {
        if (!message.guild) return message.reply('Bu komut sadece sunucularda kullanılabilir.');
        
        // Yönetici yetkisi kontrolü
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Yetki Hatası')
                .setDescription('Bu komutu sadece sunucu yöneticileri kullanabilir!')
                .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        const sub = args[0];

        if (!sub) {
            const helpEmbed = new EmbedBuilder()
                .setColor('#4ECDC4')
                .setTitle('⚙️ Otorol Sistemi')
                .setDescription('Sunucuya giren herkese otomatik rol verme sistemi:')
                .addFields(
                    { name: '🎯 Otorol Ayarla', value: '`!otorol ayarla <@rol>` - Otorol sistemini aktif eder', inline: true },
                    { name: '🚫 Otorol Kaldır', value: '`!otorol kaldir` - Otorol sistemini devre dışı bırakır', inline: true },
                    { name: '📊 Durum Kontrolü', value: '`!otorol durum` - Mevcut otorol ayarlarını gösterir', inline: true }
                )
                .addFields(
                    { name: 'ℹ️ Bilgi', value: 'Bu sistem sunucuya yeni katılan herkese otomatik olarak belirlenen rolü verir.', inline: false }
                )
                .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTimestamp();
            
            return message.reply({ embeds: [helpEmbed] });
        }

        if (sub === 'ayarla') {
            const role = message.mentions.roles.first();
            
            if (!role) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Rol Belirtilmedi')
                    .setDescription('Lütfen bir rol belirtin!')
                    .addFields(
                        { name: 'Kullanım', value: '`!otorol ayarla <@rol>`', inline: true },
                        { name: 'Örnek', value: '`!otorol ayarla @Üye`', inline: true }
                    )
                    .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            // Bot'un rolü verebilme yetkisi kontrolü
            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Bot Yetkisi Eksik')
                    .setDescription('Bot\'un rol yönetme yetkisi yok!')
                    .addFields(
                        { name: 'Gerekli Yetki', value: 'Rol Yönet', inline: true },
                        { name: 'Çözüm', value: 'Bot\'a "Rol Yönet" yetkisi verin', inline: true }
                    )
                    .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            // Bot'un belirtilen rolü verebilme kontrolü
            if (role.position >= message.guild.members.me.roles.highest.position) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Rol Yetkisi Eksik')
                    .setDescription('Bot bu rolü veremez!')
                    .addFields(
                        { name: 'Rol', value: role.name, inline: true },
                        { name: 'Sebep', value: 'Bot\'un en yüksek rolünden daha yüksek', inline: true }
                    )
                    .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            // Otorol ayarla
            const success = await setAutoRole(message.guild.id, role.id);
            
            if (success) {
                const successEmbed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('✅ Otorol Ayarlandı')
                    .setDescription(`${role} rolü otorol olarak ayarlandı!`)
                    .addFields(
                        { name: '🎯 Rol', value: role.name, inline: true },
                        { name: '🆔 Rol ID', value: role.id, inline: true },
                        { name: '👥 Renk', value: role.hexColor, inline: true }
                    )
                    .addFields(
                        { name: 'ℹ️ Bilgi', value: 'Artık sunucuya katılan herkese bu rol otomatik olarak verilecek.', inline: false }
                    )
                    .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                    .setTimestamp();
                
                return message.reply({ embeds: [successEmbed] });
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Ayar Hatası')
                    .setDescription('Otorol ayarlanırken bir hata oluştu!')
                    .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }
        }

        if (sub === 'kaldir') {
            const success = await removeAutoRole(message.guild.id);
            
            if (success) {
                const successEmbed = new EmbedBuilder()
                    .setColor('#FF9800')
                    .setTitle('🚫 Otorol Kaldırıldı')
                    .setDescription('Otorol sistemi devre dışı bırakıldı!')
                    .addFields(
                        { name: 'ℹ️ Bilgi', value: 'Artık yeni katılan üyelere otomatik rol verilmeyecek.', inline: false }
                    )
                    .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                    .setTimestamp();
                
                return message.reply({ embeds: [successEmbed] });
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Kaldırma Hatası')
                    .setDescription('Otorol kaldırılırken bir hata oluştu!')
                    .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }
        }

        if (sub === 'durum') {
            const autoRoleId = await getAutoRole(message.guild.id);
            
            if (autoRoleId) {
                const role = message.guild.roles.cache.get(autoRoleId);
                
                if (role) {
                    const statusEmbed = new EmbedBuilder()
                        .setColor('#2196F3')
                        .setTitle('📊 Otorol Durumu')
                        .setDescription('Otorol sistemi aktif!')
                        .addFields(
                            { name: '🎯 Aktif Rol', value: role.name, inline: true },
                            { name: '🆔 Rol ID', value: role.id, inline: true },
                            { name: '👥 Renk', value: role.hexColor, inline: true },
                            { name: '📈 Üye Sayısı', value: role.members.size.toString(), inline: true },
                            { name: '🔧 Pozisyon', value: role.position.toString(), inline: true },
                            { name: '✅ Durum', value: 'Aktif', inline: true }
                        )
                        .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                        .setTimestamp();
                    
                    return message.reply({ embeds: [statusEmbed] });
                } else {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF9800')
                        .setTitle('⚠️ Rol Bulunamadı')
                        .setDescription('Ayarlandı rol artık mevcut değil!')
                        .addFields(
                            { name: '🆔 Rol ID', value: autoRoleId, inline: true },
                            { name: '🔧 Çözüm', value: 'Rolü yeniden ayarlayın veya sistemi kaldırın', inline: true }
                        )
                        .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                        .setTimestamp();
                    
                    return message.reply({ embeds: [errorEmbed] });
                }
            } else {
                const statusEmbed = new EmbedBuilder()
                    .setColor('#9E9E9E')
                    .setTitle('📊 Otorol Durumu')
                    .setDescription('Otorol sistemi devre dışı!')
                    .addFields(
                        { name: '🎯 Aktif Rol', value: 'Yok', inline: true },
                        { name: '✅ Durum', value: 'Devre Dışı', inline: true }
                    )
                    .addFields(
                        { name: 'ℹ️ Bilgi', value: 'Otorol sistemini aktif etmek için `!otorol ayarla <@rol>` komutunu kullanın.', inline: false }
                    )
                    .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
                    .setTimestamp();
                
                return message.reply({ embeds: [statusEmbed] });
            }
        }

        // Bilinmeyen alt komut
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Bilinmeyen Komut')
            .setDescription('Geçersiz alt komut!')
            .addFields(
                { name: 'Kullanım', value: '`!otorol ayarla <@rol>`\n`!otorol kaldir`\n`!otorol durum`', inline: false }
            )
            .setFooter({ text: 'PudiBot • Otorol Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();
        
        return message.reply({ embeds: [errorEmbed] });
    }
}; 