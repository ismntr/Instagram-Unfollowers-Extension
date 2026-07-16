# Instagram Unfollower Extension 🚀

A Proof of Concept (PoC) Google Chrome Extension (Manifest V3) that reads a CSV of Instagram usernames and sequentially unfollows them using direct API integration and randomized delays.

## 🌟 How it works

This extension works in two phases: first you generate a CSV of users you don't want to follow anymore, and then this extension processes that list.

1. **Prerequisite (Generating the CSV):** Use the [IG Tracker - Followers & Unfollowers](https://chromewebstore.google.com/detail/ig-tracker-%E2%80%93-followers-un/gpnpbncjakifkeechdhlajmpmliablmc) Chrome extension to find out who is not following you back, and export that list as a CSV file.
2. **Execution:** You upload that CSV to this extension.
3. The extension queries Instagram's `web_profile_info` API to resolve the username into a numeric User ID.
4. It sends a direct, authenticated `POST` request to Instagram's unfollow endpoint.
5. It sleeps for a random duration (15-30 seconds) to simulate human behavior and avoid rate limits, then moves to the next user.

## ✨ Features

- **Direct ID Resolution:** Finds the hidden internal ID for any Instagram username automatically.
- **CSV Processing:** Just drop your CSV (username in the first column) and let it run.
- **Randomized Human-like Delays:** Waits between 5 and 15 seconds before each unfollow action.
- **Rate-Limit Handling:** Automatically pauses the queue for 15 minutes if Instagram returns a `429 Too Many Requests` status.

## ⚠️ Disclaimer

**This project is for educational purposes and as a Proof of Concept only.** Automating actions on Instagram violates their Terms of Service. Use this at your own risk. The authors are not responsible for any account bans, suspensions, or restrictions that may occur from using this software.

## 🛠 Installation (Developer Mode)

1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the folder containing this project.

## 🚀 Usage

### Step 1: Get Your Unfollow List
1. Install [IG Tracker - Followers & Unfollowers](https://chromewebstore.google.com/detail/ig-tracker-%E2%80%93-followers-un/gpnpbncjakifkeechdhlajmpmliablmc) from the Chrome Web Store.
2. Run IG Tracker on your Instagram profile to find users who don't follow you back.
3. Export this list as a CSV file.

### Step 2: Run the Unfollower
1. Log in to your Instagram account on Chrome and stay on any Instagram page.
2. Click this extension's icon in your Chrome toolbar.
3. Click **Choose File** and upload the CSV you exported in Step 1.
4. Click **Start Engine**.
5. Keep the Instagram tab open in the background. The extension will begin finding IDs and unfollowing users safely one by one.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

# Instagram Takipten Çıkma Eklentisi 🚀

Instagram kullanıcı adlarını içeren bir CSV dosyasını okuyan ve doğrudan API entegrasyonu ile rastgele bekleme süreleri kullanarak kullanıcıları sırayla takipten çıkaran bir Proof of Concept (PoC) Google Chrome Eklentisi (Manifest V3).

## 🌟 Nasıl çalışır

Bu eklenti iki aşamalı çalışır: Önce sizi takip etmeyenlerin olduğu bir CSV dosyası oluşturursunuz, ardından bu eklenti o listeyi işler.

1. **Ön Koşul (CSV Oluşturma):** Sizi geri takip etmeyenleri bulmak ve bu listeyi bir CSV dosyası olarak dışa aktarmak için [IG Tracker - Followers & Unfollowers](https://chromewebstore.google.com/detail/ig-tracker-%E2%80%93-followers-un/gpnpbncjakifkeechdhlajmpmliablmc) Chrome eklentisini kullanın.
2. **Çalıştırma:** Çıkardığınız CSV dosyasını bu eklentiye yüklersiniz.
3. Eklenti, kullanıcı adını sayısal bir Kullanıcı ID'sine dönüştürmek için Instagram'ın `web_profile_info` API'sini sorgular.
4. Instagram'ın unfollow (takipten çıkma) uç noktasına doğrudan, kimlik doğrulamalı bir `POST` isteği gönderir.
5. Hız sınırlarına (rate limits) takılmamak ve insan davranışını taklit etmek için rastgele bir süre (15-30 saniye) bekler, ardından bir sonraki kullanıcıya geçer.

## ✨ Özellikler

- **Doğrudan ID Çözümleme:** Herhangi bir Instagram kullanıcı adı için gizli dahili ID'yi otomatik olarak bulur.
- **CSV İşleme:** CSV dosyanızı yükleyin (kullanıcı adları ilk sütunda olmalı) ve gerisini eklentiye bırakın.
- **Rastgele İnsansı Beklemeler:** Her bir takipten çıkma işleminden önce 15 ile 30 saniye arasında rastgele bekler.
- **Hız Sınırı Koruması:** Instagram `429 Too Many Requests` durumu döndürürse veya oturumunuz düşerse kuyruğu otomatik olarak duraklatır/durdurur.

## ⚠️ Yasal Uyarı

**Bu proje sadece eğitim amaçlıdır ve bir Proof of Concept (Konsept Kanıtı) niteliğindedir.** Instagram üzerinde işlemleri otomatikleştirmek, Instagram'ın Hizmet Şartları'nı ihlal eder. Kullanım riski tamamen size aittir. Bu yazılımın kullanımından doğabilecek herhangi bir hesap yasaklaması, askıya alma veya kısıtlamadan yazarlar sorumlu değildir.

## 🛠 Kurulum (Geliştirici Modu)

1. Bu depoyu bilgisayarınıza indirin veya klonlayın.
2. Google Chrome'u açın ve `chrome://extensions/` adresine gidin.
3. Sağ üst köşedeki düğmeyi kullanarak **Geliştirici modunu (Developer mode)** etkinleştirin.
4. Sol üstteki **Paketlenmemiş öğe yükle (Load unpacked)** düğmesine tıklayın.
5. Bu projenin bulunduğu klasörü seçin.

## 🚀 Kullanım

### 1. Adım: Takipten Çıkılacaklar Listesini Alma
1. Chrome Web Mağazası'ndan [IG Tracker - Followers & Unfollowers](https://chromewebstore.google.com/detail/ig-tracker-%E2%80%93-followers-un/gpnpbncjakifkeechdhlajmpmliablmc) eklentisini yükleyin.
2. Sizi geri takip etmeyen kullanıcıları bulmak için IG Tracker'ı çalıştırın.
3. Bu listeyi bir CSV dosyası olarak dışa aktarın.

### 2. Adım: Unfollower Eklentisini Çalıştırma
1. Chrome'da Instagram hesabınıza giriş yapın ve herhangi bir Instagram sayfasında açık kalın.
2. Chrome araç çubuğundaki bu eklentinin simgesine tıklayın.
3. **Dosya Seç (Choose File)** butonuna tıklayın ve 1. Adımda dışa aktardığınız CSV'yi yükleyin.
4. **Start Engine** düğmesine tıklayın.
5. Arka planda Instagram sekmesini açık tutun. Eklenti, ID'leri bulmaya ve kullanıcıları güvenli bir şekilde tek tek takipten çıkarmaya başlayacaktır.

## 📝 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.
