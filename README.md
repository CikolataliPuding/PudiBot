# 🤖 PudiBot - Discord Moderasyon Botu

PudiBot, Discord sunucuları için gelişmiş moderasyon özellikleri sunan bir bot'tur. Prefix tabanlı komut sistemi ile kolay kullanım sağlar.

## ✨ Özellikler

### 🔧 Temel Komutlar
- `!ping` - Bot gecikmesini göster
- `!zar` - Zar at
- `!yazitura` - Yazı tura at
- `!sunucu` - Sunucu bilgilerini göster
- `!yardim` - Tüm komutları listele

### 🛡️ Moderasyon Komutları

#### 🔇 Mute Sistemi
- `!mute <@kullanıcı> <süre> <sebep>` - Kullanıcıyı mute et
- `!unmute <@kullanıcı> <sebep>` - Kullanıcının mute'ını kaldır
- Discord'un timeout özelliğini kullanır
- Süre formatları: `s` (saniye), `m` (dakika), `h` (saat), `d` (gün)
- Örnek: `!mute @kullanıcı 1h Spam yapma`

#### 🔨 Ban Sistemi
- `!ban <@kullanıcı> <sebep>` - Kullanıcıyı banla
- `!unban <kullanıcı_id> <sebep>` - Kullanıcının banını kaldır
- Yetki hiyerarşisi kontrolü
- Örnek: `!ban @kullanıcı Kuralları ihlal etti`

#### 👢 Kick Sistemi
- `!kick <@kullanıcı> <sebep>` - Kullanıcıyı sunucudan at
- Örnek: `!kick @kullanıcı Uygunsuz davranış`

#### ⚠️ Uyarı Sistemi
- `!warn <@kullanıcı> <sebep>` - Kullanıcıya uyarı ver
- `!unwarn <@kullanıcı> <uyarı_id> <sebep>` - Kullanıcının uyarısını kaldır
- Uyarı geçmişi saklanır
- Örnek: `!warn @kullanıcı Spam yapma`

#### 📋 Sicil Sistemi
- `!sicil <@kullanıcı>` - Kullanıcının moderasyon geçmişini göster
- Uyarı sayısı ve detayları
- Ban geçmişi
- Hesap bilgileri

#### 🧹 Mesaj Temizleme
- `!temizle <sayı> [@kullanıcı]` - Mesaj sil
- Belirli kullanıcının mesajlarını silme
- 1-100 arası mesaj silebilir
- Örnek: `!temizle 10` veya `!temizle 50 @kullanıcı`

### 📝 Log Sistemi

#### Log Kanalı Ayarları
- `!mutelog <#kanal>` - Mute log kanalını ayarla
- `!banlog <#kanal>` - Ban log kanalını ayarla
- `!warnlog <#kanal>` - Warn log kanalını ayarla
- `!mesajlog <#kanal>` - Mesaj log kanalını ayarla

#### Otomatik Loglama
- Tüm moderasyon işlemleri loglanır
- Mesaj silme/düzenleme logları
- Embed formatında detaylı bilgiler
- Gif thumbnail'ları

## 🚀 Kurulum

1. **Gereksinimler**
   - Node.js 16.9.0 veya üzeri
   - Discord Bot Token

2. **Kurulum Adımları**
   ```bash
   # Projeyi klonla
   git clone <repository-url>
   cd PudiBot

   # Bağımlılıkları yükle
   npm install

   # config.json dosyasını düzenle
   # Discord Developer Portal'dan bot token'ını al
   ```

3. **config.json Yapılandırması**
   ```json
   {
     "token": "BOT_TOKEN_BURAYA",
     "clientId": "BOT_CLIENT_ID_BURAYA"
   }
   ```

4. **Bot'u Başlat**
   ```bash
   npm start
   ```

## 🔐 Gerekli Yetkiler

Bot'un çalışması için aşağıdaki yetkilere ihtiyaç vardır:

### Bot Yetkileri
- **Üyeleri Yönet** - Mute, warn işlemleri için
- **Üyeleri Yasakla** - Ban işlemleri için
- **Üyeleri At** - Kick işlemleri için
- **Mesajları Yönet** - Mesaj silme işlemleri için
- **Mesaj Gönder** - Log kanallarına mesaj göndermek için

### Kullanıcı Yetkileri
- **Yönetici** - Log kanalı ayarları için
- **Üyeleri Yönet** - Mute, warn işlemleri için
- **Üyeleri Yasakla** - Ban işlemleri için
- **Üyeleri At** - Kick işlemleri için
- **Mesajları Yönet** - Mesaj silme işlemleri için

## 📁 Proje Yapısı

```
PudiBot/
├── commands/           # Moderasyon komutları
│   ├── mute.js        # Mute komutu
│   ├── unmute.js      # Unmute komutu
│   ├── ban.js         # Ban komutu
│   ├── unban.js       # Unban komutu
│   ├── kick.js        # Kick komutu
│   ├── warn.js        # Warn komutu
│   ├── unwarn.js      # Unwarn komutu
│   ├── sicil.js       # Sicil komutu
│   ├── temizle.js     # Mesaj temizleme
│   ├── mutelog.js     # Mute log ayarı
│   ├── banlog.js      # Ban log ayarı
│   ├── warnlog.js     # Warn log ayarı
│   └── mesajlog.js    # Mesaj log ayarı
├── events/            # Event handler'ları
│   └── messageLog.js  # Mesaj loglama
├── utils/             # Yardımcı fonksiyonlar
│   └── logHelper.js   # Log sistemi yardımcıları
├── data/              # Veri dosyaları (otomatik oluşturulur)
│   ├── warnings.json  # Uyarı geçmişi
│   └── logchannels.json # Log kanalı ayarları
├── index.js           # Ana bot dosyası
├── config.json        # Bot yapılandırması
└── package.json       # Proje bağımlılıkları
```

## 🎨 Embed Özellikleri

Tüm moderasyon komutları embed mesajları kullanır:
- **Renkli başlıklar** - İşlem türüne göre renk kodlaması
- **Gif thumbnail'ları** - Görsel efektler
- **Detaylı bilgiler** - Kullanıcı ID, tarih, sebep
- **Footer bilgileri** - Ek detaylar

## 🔧 Özelleştirme

### Log Kanalı Ayarları
1. Sunucunuzda log kanalları oluşturun (örn: `#mute-log`, `#ban-log`)
2. Bot'a bu kanallarda mesaj gönderme yetkisi verin
3. Komutları kullanarak log kanallarını ayarlayın:
   ```
   !mutelog #mute-log
   !banlog #ban-log
   !warnlog #warn-log
   !mesajlog #mesaj-log
   ```

### Gif Thumbnail'ları
Komut dosyalarındaki thumbnail URL'lerini değiştirerek özel gif'ler kullanabilirsiniz.

## 📊 Veri Saklama

Bot aşağıdaki verileri yerel olarak saklar:
- **Uyarı geçmişi** - `data/warnings.json`
- **Log kanalı ayarları** - `data/logchannels.json`

Bu dosyalar otomatik olarak oluşturulur ve yönetilir.

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **Bot yetkisi hatası**
   - Bot'un gerekli yetkilere sahip olduğundan emin olun
   - Sunucu ayarlarından bot rolünü kontrol edin

2. **Log kanalı çalışmıyor**
   - Log kanalının doğru ayarlandığından emin olun
   - Bot'un kanala mesaj gönderme yetkisi olduğunu kontrol edin

3. **Komut çalışmıyor**
   - Prefix'in `!` olduğundan emin olun
   - Kullanıcının gerekli yetkilere sahip olduğunu kontrol edin

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📞 İletişim

Sorularınız için GitHub Issues kullanabilirsiniz.

---

**PudiBot v2.1** - Gelişmiş Discord Moderasyon Sistemi 