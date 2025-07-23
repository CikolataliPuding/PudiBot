const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'embed',
    description: 'Özel bir embed mesajı oluşturur.',
    usage: '!embed',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ Bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısın.');
        }

        const filter = m => m.author.id === message.author.id;
        const sor = async (soru) => {
            const soruMsg = await message.channel.send(soru);
            try {
                const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
                const yanitMsg = collected.first();
                const yanit = yanitMsg.content;
                if (yanit.toLowerCase() === 'iptal') {
                    await soruMsg.delete().catch(() => {});
                    await yanitMsg.delete().catch(() => {});
                    throw new Error('İptal edildi');
                }
                // Yanıtı döndürmeden önce mesajları sil
                await soruMsg.delete().catch(() => {});
                await yanitMsg.delete().catch(() => {});
                if (yanit.toLowerCase() === 'geç') return '';
                return yanit;
            } catch {
                await soruMsg.delete().catch(() => {});
                throw new Error('Yanıt alınamadı veya iptal edildi.');
            }
        };

        try {
            await message.reply('Embed oluşturma işlemini başlatmak için istediğiniz alanları doldurun. Herhangi bir adımda `iptal` yazarak işlemi iptal edebilirsiniz.');
            // 1. Mesaj içeriği
            const description = await sor('📥 Embed mesajınızı giriniz:');
            // 2. Renk kodu
            const color = await sor('🎨 Renk kodunu giriniz (örn: #0099ff) veya boş bırakın:');
            // 3. Başlık
            const title = await sor('🏷️ Başlık giriniz (veya boş bırakın):');
            // 4. Footer
            const footer = await sor('🦶 Footer giriniz (veya boş bırakın):');
            // 5. Thumbnail URL
            const thumbnail = await sor('🖼️ Thumbnail (küçük görsel) URL giriniz (veya geç yazın):');
            // 6. Görsel URL
            const image = await sor('🖼️ Büyük görsel (image) URL giriniz (veya geç yazın):');

            const embed = new EmbedBuilder()
                .setDescription(description);
            if (color && /^#?[0-9a-fA-F]{6}$/.test(color.replace('#',''))) embed.setColor(color.startsWith('#') ? color : `#${color}`);
            if (title) embed.setTitle(title);
            if (footer) embed.setFooter({ text: footer });
            if (thumbnail && thumbnail.startsWith('http')) embed.setThumbnail(thumbnail);
            if (image && image.startsWith('http')) embed.setImage(image);

            await message.channel.send({ embeds: [embed] });
            await message.reply('✅ Embed mesajı başarıyla gönderildi!');
        } catch (err) {
            await message.reply(`❌ İşlem iptal edildi veya hata oluştu: ${err.message}`);
        }
    }
}; 