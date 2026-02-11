# 🛡️ DNS Degistirici v1.0

<div align="center">
  <img src="app-icon.svg" width="128" height="128" alt="DNS Degistirici Logo" />
  <br/>
  <br/>
  
  **Hızlı, Güvenli ve Modern DNS Değiştirme Aracı**
  
  [![Tauri](https://img.shields.io/badge/Tauri-v2-orange?style=flat-square&logo=tauri)](https://tauri.app)
  [![React](https://img.shields.io/badge/React-v18-blue?style=flat-square&logo=react)](https://reactjs.org)
  [![Rust](https://img.shields.io/badge/Rust-Backend-black?style=flat-square&logo=rust)](https://www.rust-lang.org)
  [![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

## ✨ Özellikler

*   **🚀 Hızlı Değişim:** Tek tıkla Cloudflare, Google, Quad9 ve OpenDNS arasında geçiş yapın.
*   **🔒 Güvenlik Odaklı:** Yönetici izinlerini kontrol eder ve güvenli bir şekilde DNS ayarlarını uygular.
*   **🎨 Modern Arayüz:** sc0x01 tasarım diline uygun, minimalist ve şık kullanıcı arayüzü.
*   **tray Entegrasyonu:** Sistem tepsisinden (System Tray) arka planda çalışır, hızlı erişim sağlar.
*   **⚡ Hafif:** Rust backend sayesinde minimum kaynak tüketimi ( < 5MB RAM).
*   **Auto-Update:** (Planlanan) Otomatik güncelleme desteği.

## 🛠️ Kurulum

En son sürümü [Releases](https://github.com/sc0x01/dns-degistirici/releases) sayfasından indirebilirsiniz.

**Kurulumsuz (Portable):** `.exe` dosyasını indirip direkt çalıştırın.
**Kurulumlu (Setup):** `setup.exe` dosyasını indirip kurun.

## 💻 Geliştirme (Development)

Bu projeyi yerel ortamınızda geliştirmek için:

1.  Repoyu klonlayın:
    ```bash
    git clone https://github.com/sc0x01/dns-degistirici.git
    cd dns-degistirici
    ```

2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```

3.  Geliştirme modunda çalıştırın:
    ```bash
    npm run tauri dev
    ```

## 🏗️ Build (Derleme)

Projenin `.exe` çıktısını almak için:

```bash
npm run tauri build
```
Derlenen dosyalar `src-tauri/target/release/bundle/nsis/` altında olacaktır.

## 🤝 Katkıda Bulunma

PR'lar (Pull Requests) kabul edilir. Büyük değişiklikler için önce bir Issue açarak tartışalım.

## 📝 Lisans

Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.

---
<div align="center">
  Developed with ❤️ by <a href="https://github.com/sc0x01">sc0x01</a>
</div>
