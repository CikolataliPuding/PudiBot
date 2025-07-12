const { EmbedBuilder } = require('discord.js');
const { getLogChannel, getAutoRole } = require('../utils/database');

module.exports = {
    events: {
        // Kullanıcı sunucuya katıldığında
        guildMemberAdd: async (member) => {
            try {
                // Otorol sistemi
                const autoRoleId = await getAutoRole(member.guild.id);
                let autoRole = null;
                
                if (autoRoleId) {
                    autoRole = member.guild.roles.cache.get(autoRoleId);
                    if (autoRole && member.guild.members.me.permissions.has('ManageRoles')) {
                        try {
                            await member.roles.add(autoRole);
                            console.log(`✅ ${member.user.tag} kullanıcısına ${autoRole.name} rolü verildi (Otorol)`);
                        } catch (roleError) {
                            console.error(`❌ Otorol verme hatası (${member.user.tag}):`, roleError);
                        }
                    }
                }

                // Gelen log kanalı
                const joinLogChannelId = await getLogChannel(member.guild.id, 'joinLog');
                
                if (joinLogChannelId) {
                    const logChannel = member.guild.channels.cache.get(joinLogChannelId);
                    
                    if (logChannel && logChannel.permissionsFor(member.guild.members.me).has('SendMessages')) {
                        const joinEmbed = new EmbedBuilder()
                            .setColor('#00ff00')
                            .setTitle('👋 Kullanıcı Sunucuya Katıldı')
                            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                            .addFields(
                                { name: '👤 Kullanıcı', value: `${member.user}`, inline: true },
                                { name: '🆔 Kullanıcı ID', value: member.user.id, inline: true },
                                { name: '📅 Hesap Oluşturma', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: true },
                                { name: '📊 Sunucu Üye Sayısı', value: `${member.guild.memberCount}`, inline: true }
                            )
                            .setFooter({ text: `Hoş geldin ${member.user.username}!`, iconURL: member.guild.iconURL({ dynamic: true }) })
                            .setTimestamp();


                        await logChannel.send({ embeds: [joinEmbed] });
                    }
                }
            } catch (error) {
                console.error('Kullanıcı katılma işlemi hatası:', error);
            }
        },

        // Kullanıcı sunucudan ayrıldığında
        guildMemberRemove: async (member) => {
            try {
                const leaveLogChannelId = await getLogChannel(member.guild.id, 'leaveLog');
                
                if (leaveLogChannelId) {
                    const logChannel = member.guild.channels.cache.get(leaveLogChannelId);
                    
                    if (logChannel && logChannel.permissionsFor(member.guild.members.me).has('SendMessages')) {
                        const leaveEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('👋 Kullanıcı Sunucudan Ayrıldı')
                            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                            .addFields(
                                { name: '👤 Kullanıcı', value: `${member.user}`, inline: true },
                                { name: '🆔 Kullanıcı ID', value: member.user.id, inline: true },
                                { name: '📅 Katılma Tarihi', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
                                { name: '📊 Sunucu Üye Sayısı', value: `${member.guild.memberCount}`, inline: true }
                            )
                            .setFooter({ text: `Görüşürüz ${member.user.username}!`, iconURL: member.guild.iconURL({ dynamic: true }) })
                            .setTimestamp();

                        await logChannel.send({ embeds: [leaveEmbed] });
                    }
                }
            } catch (error) {
                console.error('Kullanıcı ayrılma log hatası:', error);
            }
        }
    }
}; 