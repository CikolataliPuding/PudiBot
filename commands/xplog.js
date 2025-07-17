const { setLogChannel } = require('../utils/database');

module.exports = {
    name: 'xplog',
    description: 'Level up mesajlarının gönderileceği kanalı ayarlar. Örnek: !xplog #kanal veya !xplog anlık',
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Bu komutu kullanmak için yönetici olmalısın.');
        }
        if (!message.guild) return message.reply('Bu komut sadece sunucularda kullanılabilir.');
        if (!args[0]) return message.reply('Bir kanal etiketle veya "anlık" yaz. Örnek: !xplog #kanal veya !xplog anlık');

        let channelId = null;
        if (args[0] === 'anlık') {
            channelId = 'current';
        } else {
            const channel = message.mentions.channels.first();
            if (!channel) return message.reply('Lütfen geçerli bir kanal etiketle.');
            channelId = channel.id;
        }

        await setLogChannel(message.guild.id, 'levelup', channelId);
        message.reply(`Level up mesajları artık ${channelId === 'current' ? 'anlık olarak mesaj yazılan kanala' : `<#${channelId}> kanalına`} gönderilecek.`);
    }
}; 