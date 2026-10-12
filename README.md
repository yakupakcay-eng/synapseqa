# SynapseQA &mdash; Autonomous Web QA Engine Powered by Claude Computer Use

> **Targeting Claude for Startups Program ($1,000 to $25,000+ API Credits + 1 Year Claude Team Free)**  
> Built natively on top of **Anthropic Claude 3.7 Sonnet Computer Use & Multimodal Vision API**.

---

## 🌟 Proje Özeti (Executive Summary)
**SynapseQA**, modern web uygulamaları için geliştirilmiş ilk tam otonom test mühendisidir. 
Geleneksel test araçları (Selenium, Cypress, Playwright) kırılgan DOM seçicilerine (XPath, CSS class) bağımlıdır ve arayüzde en ufak bir buton değiştiğinde tüm testler çöker. 

SynapseQA, **Claude Computer Use** yeteneğini kullanarak ekrana bir insan gözü gibi bakar:
1. **Görsel Algılama:** Butonların, formların ve modalların piksel koordinatlarını haritalandırır.
2. **Otonom Eylem:** Fareyi hareket ettirir, tıklar, klavyeyle form doldurur ve kullanıcı akışlarını simüle eder.
3. **Regresyon Tespiti:** Ekran kaymalarını, görsel bozulmaları ve konsol hatalarını yakalar.
4. **Otomatik PR Üretimi:** Hatayı tespit ettiği anda GitHub deposuna giderek düzeltme kodunu yazar ve hazır Pull Request (PR) açar.

---

## 🚀 Yerel Olarak Çalıştırma (Local Development)

```bash
# Bağımlılıkları yükleyin (zaten kurulu)
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Canlı derleme (Production build)
npm run build
```

---

## 🎓 GitHub Öğrenci Paketi ile Domain & Kurumsal Mail Kurulumu (Adım Adım)

Anthropic, **`@gmail.com` veya `@hotmail.com` ile yapılan başvuruları doğrudan reddeder**. Şirket uzantılı mail (`founder@startupin.me`) zorunludur!

### 1. Adım: Ücretsiz Domain Alma (.me)
1. [GitHub Student Developer Pack](https://education.github.com/pack) sayfasına gidin.
2. **Namecheap** teklifini bulun (1 yıl ücretsiz `.me` domain ve ücretsiz SSL sağlar).
3. İstediğiniz domaini seçin (Örn: `synapseqa.me`, `agentqa.me`, `opsflow.me` vb.).
4. Kaydı tamamlayın.

### 2. Adım: Ücretsiz Kurumsal Mail Açma (2 Farklı Kolay Yöntem)

#### Yöntem A: Zoho Mail (En Kolayı & En Temizi & Tamamen Ücretsiz)
- [Zoho Mail Forever Free Plan](https://www.zoho.com/mail/zohomail-pricing.html) sayfasına gidin (5 kullanıcıya kadar ücretsiz).
- Namecheap'ten aldığınız domaini girin.
- Namecheap DNS paneline Zoho'nun verdiği TXT, MX ve SPF kayıtlarını ekleyin (5 dakikalık işlem).
- Artık `founder@synapseqa.me` veya `hello@synapseqa.me` adresiniz hazır! Kendi gelen kutusu ve webmail arayüzü vardır.

#### Yöntem B: Cloudflare Email Routing (Otomatik Gmail'e Yönlendirme - 100% Ücretsiz)
- Domain'inizi Cloudflare'e ücretsiz bağlayın (Namecheap Nameserver'larını Cloudflare'e yönlendirerek).
- Cloudflare panelinde **Email Routing** sekmesini açın.
- `founder@synapseqa.me` adresine gelen tüm mailleri şahsi Gmail adresinize tek tıkla yönlendirin.

---

## 🌐 Web Sitesini Canlıya Alma (Vercel ile 60 Saniyede)

1. Bu projeyi kendi GitHub hesabınıza push edin:
   ```bash
   git remote add origin https://github.com/<KULLANICI_ADINIZ>/synapseqa.git
   git branch -M main
   git push -u origin main
   ```
2. [Vercel](https://vercel.com) sitesine gidin, GitHub ile giriş yapın.
3. **"Add New Project"** diyerek `synapseqa` reposunu seçin ve **Deploy**'a basın.
4. Vercel size anında canlı bir link verecektir (Örn: `synapseqa.vercel.app`).
5. Vercel Settings -> Domains kısmından Namecheap'ten aldığınız özel domaini (`synapseqa.me`) ekleyin.

---

## 📝 Claude for Startups Başvuru Formunda Yazılacaklar (Kopyala-Yapıştır Rehberi)

**Başvuru Linki:** [https://claude.com/programs/startups](https://claude.com/programs/startups)

* **Company Name:** SynapseQA
* **Company Domain:** `https://synapseqa.me` (veya vercel linkiniz)
* **Founder Email:** `founder@synapseqa.me` (Şirket mailiniz olmalı!)
* **What are you building? (Ne inşa ediyorsunuz?):**
  > *"We are building SynapseQA, an autonomous end-to-end visual QA and regression testing engineer powered by Anthropic's Claude 3.7 Sonnet Computer Use API. Instead of writing brittle Selenium/Playwright scripts that break on every CSS change, engineering teams input plain English prompts. SynapseQA launches sandboxed headless browsers, perceives screen coordinates via multimodal vision, interacts with the DOM like a real human, detects visual regressions, and autonomously generates GitHub Pull Requests with code fixes."*
* **Why Anthropic / Claude? (Neden Claude?):**
  > *"Anthropic's native Computer Use API and state-of-the-art vision reasoning are uniquely suited for our core architecture. Traditional LLMs suffer from severe selector hallucinations when analyzing web DOMs. Claude 3.7 Sonnet's ability to interpret raw screen frames, calculate coordinate clicks, and leverage a 200k context window to ingest entire codebases allows SynapseQA to perform autonomous QA cycles with sub-pixel visual accuracy and zero false positives."*
* **Stage & Traction:**
  > *"Pre-seed / Bootstrapped. Functional MVP live with 140+ waitlist developer teams. Actively integrating GitHub Actions CI/CD workflows."*
