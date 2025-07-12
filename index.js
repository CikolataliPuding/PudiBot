const { Client, Collection, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');
const path = require('path');
const { connectToDatabase, closeConnection } = require('./utils/database');

// Bot client'ını oluştur
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Komutları saklamak için collection
client.commands = new Collection();

// MongoDB'ye bağlan
async function initializeDatabase() {
    try {
        await connectToDatabase();
    } catch (error) {
        console.error('❌ Veritabanı başlatılamadı:', error);
        process.exit(1);
    }
}

// Komutları yükle
function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('name' in command && 'execute' in command) {
            client.commands.set(command.name, command);
            console.log(`✅ Komut yüklendi: ${command.name}`);
        } else {
            console.log(`❌ Komut yüklenemedi: ${file} - gerekli özellikler eksik`);
        }
    }
}

// Event handler'ları yükle
function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    if (fs.existsSync(eventsPath)) {
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const eventModule = require(filePath);
            
            if (eventModule.events) {
                for (const [eventName, eventHandler] of Object.entries(eventModule.events)) {
                    client.on(eventName, eventHandler);
                    console.log(`✅ Event handler yüklendi: ${eventName}`);
                }
            }
        }
    }
}

// Bot hazır olduğunda
client.once('ready', async () => {
    console.log(`🤖 ${client.user.tag} olarak giriş yapıldı!`);
    console.log(`📊 ${client.guilds.cache.size} sunucuda aktif`);
    
    // MongoDB'ye bağlan
    await initializeDatabase();
    
    console.log('🚀 Moderasyon komutları hazır!');
});

// Mesaj geldiğinde
client.on('messageCreate', async message => {
    // Bot mesajlarını yoksay
    if (message.author.bot) return;
    
    const prefix = '!';
    
    // Prefix ile başlamıyorsa yoksay
    if (!message.content.startsWith(prefix)) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    // Komutları işle
    const command = client.commands.get(commandName) || 
                   client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
        // Eski komutları kontrol et
        switch (commandName) {
            case 'ping':
                const pingEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('🏓 Pong!')
                    .setDescription(`Bot gecikmesi: ${client.ws.ping}ms`)
                    .setTimestamp();
                await message.reply({ embeds: [pingEmbed] });
                break;
                
            case 'zar':
            case 'zarat':
                const zarSonucu = Math.floor(Math.random() * 6) + 1;
                await message.reply(`🎲 Zar atıldı: **${zarSonucu}**`);
                break;
                
            case 'yazitura':
            case 'yazıtura':
                const sonuc = Math.random() < 0.5 ? 'Yazı' : 'Tura';
                await message.reply(`🪙 **${sonuc}** geldi!`);
                break;
                
            case 'sunucu':
            case 'server':
                const serverEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`📊 ${message.guild.name} Sunucu Bilgileri`)
                    .addFields(
                        { name: '👥 Üye Sayısı', value: `${message.guild.memberCount}`, inline: true },
                        { name: '📅 Oluşturulma Tarihi', value: `<t:${Math.floor(message.guild.createdTimestamp / 1000)}:F>`, inline: true },
                        { name: '👑 Sunucu Sahibi', value: `<@${message.guild.ownerId}>`, inline: true }
                    )
                    .setThumbnail(message.guild.iconURL())
                    .setTimestamp();
                await message.reply({ embeds: [serverEmbed] });
                break;
                
            case 'yardim':
            case 'yardım':
            case 'help':
                const mainHelpEmbed = new EmbedBuilder()
                    .setColor('#4ECDC4')
                    .setTitle('🤖 PudiBot Yardım Menüsü')
                    .setDescription('Aşağıdaki butonlardan istediğiniz kategoriyi seçin:')
                    .addFields(
                        { name: '🎮 Eğlence', value: 'Zar, yazı tura, ping gibi eğlenceli komutlar', inline: true },
                        { name: '🛡️ Moderasyon', value: 'Ban, mute, warn, kick gibi moderasyon komutları', inline: true },
                        { name: '📊 Level Sistemi', value: 'Level, leaderboard, XP sistemi komutları', inline: true },
                        { name: '📝 Log Sistemi', value: 'Log kanalları ve ayarları', inline: true },
                        { name: '⚙️ Sunucu', value: 'Sunucu bilgileri ve ayarları', inline: true }
                    )
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'PudiBot v1 - Butonlu Yardım Sistemi', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('help_fun')
                            .setLabel('🎮 Eğlence')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('help_mod')
                            .setLabel('🛡️ Moderasyon')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('help_level')
                            .setLabel('📊 Level')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('help_log')
                            .setLabel('📝 Log')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('help_server')
                            .setLabel('⚙️ Sunucu')
                            .setStyle(ButtonStyle.Secondary)
                    );

                const helpMessage = await message.reply({ 
                    embeds: [mainHelpEmbed], 
                    components: [buttons] 
                });

                // Buton collector oluştur
                const collector = helpMessage.createMessageComponentCollector({ 
                    time: 300000 // 5 dakika
                });

                collector.on('collect', async (interaction) => {
                    if (interaction.user.id !== message.author.id) {
                        return interaction.reply({ 
                            content: '❌ Bu butonları sadece komutu kullanan kişi kullanabilir!', 
                            ephemeral: true 
                        });
                    }

                    if (interaction.customId === 'help_back') {
                        await interaction.update({ 
                            embeds: [mainHelpEmbed], 
                            components: [buttons] 
                        });
                        return;
                    }

                    let embed;
                    let newButtons;

                    switch (interaction.customId) {
                        case 'help_fun':
                            embed = new EmbedBuilder()
                                .setColor('#FF6B6B')
                                .setTitle('🎮 Eğlence Komutları')
                                .setDescription('İşte kullanabileceğiniz eğlence komutları:')
                                .addFields(
                                    { name: '🏓 Ping', value: '`!ping` - Bot gecikmesini gösterir', inline: true },
                                    { name: '🎲 Zar', value: '`!zar` veya `!zarat` - 1-6 arası zar atar', inline: true },
                                    { name: '🪙 Yazı Tura', value: '`!yazitura` veya `!yazıtura` - Yazı tura atar', inline: true }
                                )
                                .setFooter({ text: 'PudiBot • Eğlence Komutları', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                                .setTimestamp();
                            break;

                        case 'help_mod':
                            embed = new EmbedBuilder()
                                .setColor('#FF4757')
                                .setTitle('🛡️ Moderasyon Komutları')
                                .setDescription('İşte kullanabileceğiniz moderasyon komutları:')
                                .addFields(
                                    { name: '🔇 Mute', value: '`!mute <@kullanıcı> <süre> <sebep>` - Kullanıcıyı susturur', inline: true },
                                    { name: '🔊 Unmute', value: '`!unmute <@kullanıcı> <sebep>` - Susturmayı kaldırır', inline: true },
                                    { name: '🔨 Ban', value: '`!ban <@kullanıcı> <sebep>` - Kullanıcıyı yasaklar', inline: true },
                                    { name: '🔓 Unban', value: '`!unban <kullanıcı_id> <sebep>` - Yasaklamayı kaldırır', inline: true },
                                    { name: '👢 Kick', value: '`!kick <@kullanıcı> <sebep>` - Kullanıcıyı sunucudan atar', inline: true },
                                    { name: '⚠️ Warn', value: '`!warn <@kullanıcı> <sebep>` - Kullanıcıyı uyarır', inline: true },
                                    { name: '✅ Unwarn', value: '`!unwarn <@kullanıcı> <uyarı_id> <sebep>` - Uyarıyı kaldırır', inline: true },
                                    { name: '📋 Sicil', value: '`!sicil <@kullanıcı>` - Kullanıcının sicilini gösterir', inline: true },
                                    { name: '🧹 Temizle', value: '`!temizle <sayı> [@kullanıcı]` - Mesaj siler', inline: true },
                                    { name: '🎯 Otorol', value: '`!otorol ayarla <@rol>` - Otorol sistemini ayarlar', inline: true }
                                )
                                .setFooter({ text: 'PudiBot • Moderasyon Komutları', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                                .setTimestamp();
                            break;

                        case 'help_level':
                            embed = new EmbedBuilder()
                                .setColor('#FFD700')
                                .setTitle('📊 Level Sistemi Komutları')
                                .setDescription('İşte kullanabileceğiniz level sistemi komutları:')
                                .addFields(
                                    { name: '🎯 Level', value: '`!level` - Kendi seviyeni ve XP bilgini gösterir', inline: true },
                                    { name: '🏆 Leaderboard', value: '`!leaderboard` - Sunucu sıralamasını gösterir', inline: true },
                                    { name: '⚙️ Level Ayarları', value: '`!levelsistem` - Level sistemi ayarları (Sadece yöneticiler)', inline: true }
                                )
                                .setFooter({ text: 'PudiBot • Level Sistemi', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                                .setTimestamp();
                            break;

                        case 'help_log':
                            embed = new EmbedBuilder()
                                .setColor('#3742FA')
                                .setTitle('📝 Log Sistemi Komutları')
                                .setDescription('İşte kullanabileceğiniz log sistemi komutları:')
                                .addFields(
                                    { name: '🔇 Mute Log', value: '`!mutelog <#kanal>` - Mute log kanalını ayarlar', inline: true },
                                    { name: '🔨 Ban Log', value: '`!banlog <#kanal>` - Ban log kanalını ayarlar', inline: true },
                                    { name: '⚠️ Warn Log', value: '`!warnlog <#kanal>` - Warn log kanalını ayarlar', inline: true },
                                    { name: '💬 Mesaj Log', value: '`!mesajlog ayarla <#kanal>` - Mesaj log kanalını ayarlar', inline: true },
                                    { name: '🚫 Mesaj Muaf', value: '`!mesajlog muaf-ekle <#kanal>` - Kanalı muaf listesine ekler', inline: true },
                                    { name: '✅ Mesaj Muaf Kaldır', value: '`!mesajlog muaf-kaldir <#kanal>` - Kanalı muaf listesinden kaldırır', inline: true },
                                    { name: '📋 Mesaj Muaf Listesi', value: '`!mesajlog muaf-listesi` - Muaf kanalları listeler', inline: true },
                                    { name: '👋 Gelen/Giden Log', value: '`!gelengidenlog gelen <#kanal>` - Gelen log kanalını ayarlar\n`!gelengidenlog giden <#kanal>` - Giden log kanalını ayarlar', inline: true }
                                )
                                .setFooter({ text: 'PudiBot • Log Sistemi', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                                .setTimestamp();
                            break;

                        case 'help_server':
                            embed = new EmbedBuilder()
                                .setColor('#2ED573')
                                .setTitle('⚙️ Sunucu Komutları')
                                .setDescription('İşte kullanabileceğiniz sunucu komutları:')
                                .addFields(
                                    { name: '📊 Sunucu Bilgileri', value: '`!sunucu` veya `!server` - Sunucu bilgilerini gösterir', inline: true }
                                )
                                .setFooter({ text: 'PudiBot • Sunucu Komutları', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                                .setTimestamp();
                            break;
                    }

                    // Geri dön butonu
                    newButtons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('help_back')
                                .setLabel('🔙 Ana Menüye Dön')
                                .setStyle(ButtonStyle.Secondary)
                        );

                    await interaction.update({ 
                        embeds: [embed], 
                        components: [newButtons] 
                    });
                });

                collector.on('end', () => {
                    // Butonları devre dışı bırak
                    const disabledButtons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('help_fun')
                                .setLabel('🎮 Eğlence')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('help_mod')
                                .setLabel('🛡️ Moderasyon')
                                .setStyle(ButtonStyle.Danger)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('help_level')
                                .setLabel('📊 Level')
                                .setStyle(ButtonStyle.Success)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('help_log')
                                .setLabel('📝 Log')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('help_server')
                                .setLabel('⚙️ Sunucu')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        );

                    helpMessage.edit({ components: [disabledButtons] }).catch(() => {});
                });
                break;
                
            default:
                await message.reply('❓ Bilinmeyen komut! `!yardim` yazarak komutları görebilirsin.');
                break;
        }
        return;
    }

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(`Komut hatası (${commandName}):`, error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Komut Hatası')
            .setDescription('Komut çalıştırılırken bir hata oluştu!')
            .addFields(
                { name: 'Komut', value: commandName, inline: true },
                { name: 'Hata', value: error.message, inline: false }
            )
            .setTimestamp();
        await message.reply({ embeds: [errorEmbed] });
    }
});

// Hata yakalama
client.on('error', error => {
    console.error('Bot hatası:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Bot kapatılıyor...');
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🔄 Bot kapatılıyor...');
    await closeConnection();
    process.exit(0);
});

// Komutları ve event'leri yükle
loadCommands();
loadEvents();

// Botu başlat
client.login(token); 