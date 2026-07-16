# Instagram Unfollower Extension 🚀

A Proof of Concept (PoC) Google Chrome Extension (Manifest V3) that reads a CSV of Instagram usernames and sequentially unfollows them using direct API integration and randomized delays.

## 🌟 How it works

This extension automates the process of unfollowing users on Instagram. It is designed to work safely in the background with human-like delays (15-30 seconds per action) to protect your account from rate limits.

You simply provide it with a CSV list of usernames you want to unfollow, and the engine takes care of the rest by automatically finding their internal IDs and sending the unfollow requests.

## ✨ Features

- **Direct ID Resolution:** Finds the hidden internal ID for any Instagram username automatically.
- **CSV Processing:** Just drop your CSV (username in the first column) and let it run.
- **Randomized Human-like Delays:** Waits between 5 and 15 seconds before each unfollow action.
- **Rate-Limit Handling:** Automatically pauses the queue for 15 minutes if Instagram returns a `429 Too Many Requests` status.

## ⚠️ Disclaimer

**This project is for educational purposes and as a Proof of Concept only.** Automating actions on Instagram violates their Terms of Service. Use this at your own risk. The authors are not responsible for any account bans, suspensions, or restrictions that may occur from using this software.

## 🚀 How to Use (Step-by-Step)

### Step 1: Install This Extension (Developer Mode)
Since this is a custom tool, you need to load it manually:
1. Download or clone this project folder to your computer.
2. Open Chrome and go to `chrome://extensions/`.
3. Turn on **Developer mode** (top right switch).
4. Click **Load unpacked** (top left button) and select this project folder.

### Step 2: Get Your Unfollow List (CSV)
We need a list of people who don't follow you back. 
1. Install [IG Tracker - Followers & Unfollowers](https://chromewebstore.google.com/detail/ig-tracker-%E2%80%93-followers-un/gpnpbncjakifkeechdhlajmpmliablmc) from the Chrome Web Store.
2. Open Instagram, click the IG Tracker icon, type your username and run the scan.
3. Go to the **"Not following back"** tab in IG Tracker.
4. Click the download button to save this list as a **CSV file**.

### Step 3: Run the Unfollow Engine
1. Keep your Instagram page open and make sure you are logged in.
2. Click **our extension's icon** (Instagram Unfollower Extension) in the Chrome toolbar.
3. Click **Choose File** and upload the CSV you just downloaded.
4. Click **Start Engine**.
5. Leave the Instagram tab open in the background. The extension will slowly and safely unfollow them one by one!

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

# Instagram Takipten Çıkma Eklentisi 🚀

Instagram kullanıcı adlarını içeren bir CSV dosyasını okuyan ve doğrudan API entegrasyonu ile rastgele bekleme süreleri kullanarak kullanıcıları sırayla takipten çıkaran bir Proof of Concept (PoC) Google Chrome Eklentisi (Manifest V3).

## 🌟 Nasıl çalışır

Bu eklenti, Instagram'da toplu takipten çıkma işlemini tamamen otomatikleştirir. Hesabınızı spama düşürmemek için işlemler arasına insan davranışına benzer rastgele beklemeler (15-30 saniye) koyarak arka planda güvenle çalışır.

Tek yapmanız gereken, takipten çıkmak istediğiniz kişilerin listesini bir CSV dosyası olarak eklentiye yüklemektir. Eklenti geri kalan her şeyi halleder.

## ✨ Özellikler

- **Doğrudan ID Çözümleme:** Herhangi bir Instagram kullanıcı adı için gizli dahili ID'yi otomatik olarak bulur.
- **CSV İşleme:** CSV dosyanızı yükleyin (kullanıcı adları ilk sütunda olmalı) ve gerisini eklentiye bırakın.
- **Rastgele İnsansı Beklemeler:** Her bir takipten çıkma işleminden önce 15 ile 30 saniye arasında rastgele bekler.
- **Hız Sınırı Koruması:** Instagram `429 Too Many Requests` durumu döndürürse veya oturumunuz düşerse kuyruğu otomatik olarak duraklatır/durdurur.

## ⚠️ Yasal Uyarı

**Bu proje sadece eğitim amaçlıdır ve bir Proof of Concept (Konsept Kanıtı) niteliğindedir.** Instagram üzerinde işlemleri otomatikleştirmek, Instagram'ın Hizmet Şartları'nı ihlal eder. Kullanım riski tamamen size aittir. Bu yazılımın kullanımından doğabilecek herhangi bir hesap yasaklaması, askıya alma veya kısıtlamadan yazarlar sorumlu değildir.

## 🚀 Adım Adım Kullanım

### 1. Adım: Bu Eklentiyi Kurma (Geliştirici Modu)
Bu özel bir araç olduğu için mağazadan değil, manuel yüklememiz gerekiyor:
1. Bu projeyi bilgisayarınıza indirin ve klasöre çıkartın.
2. Google Chrome'da yeni bir sekme açın ve adres çubuğuna `chrome://extensions/` yazıp gidin.
3. Sağ üst köşedeki **Geliştirici modu (Developer mode)** anahtarını açın.
4. Sol üstteki **Paketlenmemiş öğe yükle (Load unpacked)** butonuna basıp, indirdiğiniz proje klasörünü seçin.

### 2. Adım: Çıkılacaklar Listesini Alma (CSV)
Önce bizi takip etmeyenlerin listesini bulmamız lazım:
1. Chrome Web Mağazası'ndan [IG Tracker](https://chromewebstore.google.com/detail/ig-tracker-%E2%80%93-followers-un/gpnpbncjakifkeechdhlajmpmliablmc) eklentisini kurun.
2. Instagram'ı açın, IG Tracker simgesine tıklayın, kullanıcı adınızı yazıp taramayı başlatın.
3. Tarama bitince **"Not following back"** (Geri takip etmeyenler) sekmesine geçin.
4. Oradaki indirme (download) ikonuna tıklayarak bu listeyi **CSV dosyası** olarak bilgisayarınıza kaydedin.

### 3. Adım: Takipten Çıkma Motorunu Çalıştırma
1. Chrome'da kendi Instagram sayfanızın açık ve giriş yapılmış olduğundan emin olun.
2. Chrome araç çubuğundan **bizim eklentinin (Instagram Unfollower Extension)** simgesine tıklayın.
3. **Dosya Seç (Choose File)** butonuna basıp 2. Adımda indirdiğiniz CSV dosyasını seçin.
4. **Start Engine** butonuna tıklayın.
5. Instagram sekmesini kapatmayın, arka planda açık kalsın. Eklenti yavaş ve güvenli bir şekilde herkesi takipten çıkmaya başlayacaktır!

## 📝 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.
