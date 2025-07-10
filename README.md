# PudiBot - Discord Moderasyon Botu

PudiBot, Discord sunucuları için geliştirilmiş kapsamlı bir moderasyon botudur. MongoDB veritabanı kullanarak güvenilir ve ölçeklenebilir bir yapı sunar.

## 🚀 Özellikler

### Moderasyon Komutları
- **Warn/Unwarn**: Kullanıcı uyarı sistemi
- **Ban/Unban**: Kullanıcı yasaklama sistemi
- **Kick**: Kullanıcı atma sistemi
- **Mute/Unmute**: Kullanıcı susturma sistemi
- **Temizle**: Toplu mesaj silme
- **Sicil**: Kullanıcı moderasyon geçmişi

### Log Sistemi
- **Warn Log**: Uyarı işlemlerinin loglanması
- **Ban Log**: Ban işlemlerinin loglanması
- **Mute Log**: Mute işlemlerinin loglanması
- **Mesaj Log**: Mesaj silme/düzenleme logları
- **Gelen/Giden Log**: Üye katılma/ayrılma logları

### Diğer Özellikler
- **Profil**: Kullanıcı profil bilgileri
- **Eğlence Komutları**: Zar, yazı tura, ping
- **Sunucu Bilgileri**: Detaylı sunucu istatistikleri

## 📋 Gereksinimler

- Node.js 16.9.0 veya üzeri
- MongoDB Atlas hesabı
- Discord Bot Token

## 🛠️ Kurulum

### 1. Projeyi İndirin
```bash
git clone <repository-url>
cd PudiBot
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. MongoDB Atlas Kurulumu
1. [MongoDB Atlas](https://www.mongodb.com/atlas) hesabı oluşturun
2. Yeni bir cluster oluşturun
3. Database Access bölümünden bir kullanıcı oluşturun
4. Network Access bölümünden IP adresinizi ekleyin (veya 0.0.0.0/0 ile tüm IP'lere izin verin)
5. Clusters bölümünden "Connect" butonuna tıklayın ve "Connect your application" seçin
6. Bağlantı URL'sini kopyalayın

### 4. Konfigürasyon
`config.json` dosyasını düzenleyin:

```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN_HERE",
  "mongodb": {
    "uri": "mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=PudiBot"
  }
}
```

**Önemli**: MongoDB URI'sindeki `<db_password>` kısmını gerçek şifrenizle değiştirin!

### 5. Veri Aktarımı (Eski JSON Verileri Varsa)
Eğer daha önce JSON dosyalarında veri saklıyorsanız, MongoDB'ye aktarmak için:

```bash
node migrate.js
```

### 6. Botu Başlatın
```bash
npm start
```

## 📚 Komutlar

### Moderasyon Komutları
- `!warn <@kullanıcı> [sebep]` - Kullanıcıyı uyar
- `!unwarn <@kullanıcı> <uyarı_id> [sebep]` - Uyarıyı kaldır
- `!ban <@kullanıcı> [sebep]` - Kullanıcıyı banla
- `!unban <kullanıcı_id> [sebep]` - Banı kaldır
- `!kick <@kullanıcı> [sebep]` - Kullanıcıyı at
- `!mute <@kullanıcı> <süre> [sebep]` - Kullanıcıyı sustur
- `!unmute <@kullanıcı> [sebep]` - Susturmayı kaldır
- `!temizle <sayı> [@kullanıcı]` - Mesaj sil
- `!sicil <@kullanıcı>` - Kullanıcı sicilini göster

### Log Ayarları
- `!warnlog <#kanal>` - Warn log kanalı ayarla
- `!banlog <#kanal>` - Ban log kanalı ayarla
- `!mutelog <#kanal>` - Mute log kanalı ayarla
- `!mesajlog ayarla <#kanal>` - Mesaj log kanalı ayarla
- `!mesajlog muaf-ekle <#kanal>` - Kanalı muaf listesine ekle
- `!mesajlog muaf-kaldir <#kanal>` - Kanalı muaf listesinden kaldır
- `!mesajlog muaf-listesi` - Muaf kanalları listele
- `!gelengidenlog gelen <#kanal>` - Gelen log kanalı ayarla
- `!gelengidenlog giden <#kanal>` - Giden log kanalı ayarla

### Diğer Komutlar
- `!ping` - Bot gecikmesini göster
- `!zar` - Zar at
- `!yazitura` - Yazı tura at
- `!sunucu` - Sunucu bilgilerini göster
- `!yardim` - Tüm komutları listele

## 🗄️ Veritabanı Yapısı

### Koleksiyonlar
- **warnings**: Kullanıcı uyarıları
- **logChannels**: Log kanal ayarları
- **messageLogExempt**: Mesaj log muaf kanalları

### Örnek Veri Yapıları

#### Warnings Koleksiyonu
```json
{
  "guildId": "123456789",
  "userId": "987654321",
  "warnings": [
    {
      "reason": "Spam yapma",
      "moderator": "111222333",
      "moderatorName": "Moderator#1234",
      "timestamp": 1640995200000,
      "warningId": "1640995200000"
    }
  ]
}
```

#### LogChannels Koleksiyonu
```json
{
  "guildId": "123456789",
  "warn": "111111111111111111",
  "ban": "222222222222222222",
  "mute": "333333333333333333",
  "message": "444444444444444444",
  "joinLog": "555555555555555555",
  "leaveLog": "666666666666666666"
}
```

## 🔧 Geliştirme

### Geliştirme Modu
```bash
npm run dev
```

### Yeni Komut Ekleme
1. `commands/` klasörüne yeni komut dosyası ekleyin
2. `module.exports` ile komut yapısını tanımlayın
3. MongoDB fonksiyonlarını `utils/database.js`'den kullanın

### Yeni Event Ekleme
1. `events/` klasörüne yeni event dosyası ekleyin
2. `events` objesi içinde event handler'ları tanımlayın

## 🐛 Sorun Giderme

### MongoDB Bağlantı Hatası
- MongoDB URI'nin doğru olduğundan emin olun
- Network Access ayarlarını kontrol edin
- Kullanıcı adı ve şifrenin doğru olduğundan emin olun

### Bot Yetki Hatası
- Bot'un gerekli yetkilere sahip olduğundan emin olun
- Log kanallarında mesaj gönderme yetkisi kontrol edin

### Komut Çalışmıyor
- Bot'un sunucuda olduğundan emin olun
- Komut prefix'inin doğru olduğunu kontrol edin (`!`)
- Konsol hatalarını kontrol edin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📞 İletişim

Sorularınız için issue açabilir veya Discord üzerinden iletişime geçebilirsiniz. 