# Resim Analizi ve Çizdirme API'si

Bu API, Google Gemini AI kullanarak resim analizi yapar ve analiz sonucuna göre Google Gemini'nin kendi resim oluşturma özelliği ile yeni resimler oluşturur.

## Özellikler

- **Resim Analizi**: Google Gemini AI ile resim içeriğini detaylı analiz eder
- **Resim Oluşturma**: Analiz sonucuna göre Google Gemini ile yeni resimler oluşturur
- **Dosya Upload**: Kullanıcıdan resim dosyası alır (multipart/form-data)
- **Çoklu Stil Desteği**: 6 farklı çizim stili seçeneği

## API Endpoint

```
POST /ai-chat/analyze/analyze-and-generate-image
```

## Request Format

**Content-Type**: `multipart/form-data`

### Form Fields

- `image` (required): Resim dosyası (JPEG, PNG, WebP, GIF)
- `style` (optional): Çizim stili
- `additionalPrompt` (optional): Ek açıklama

### Desteklenen Stiller

- `realistic` - Gerçekçi fotoğraf stili
- `cartoon` - Çizgi film stili
- `anime` - Anime/manga stili
- `watercolor` - Suluboya resim stili
- `oil_painting` - Yağlı boya resim stili
- `digital_art` - Dijital sanat stili

## Response Format

```json
{
  "success": true,
  "message": "Resim analizi ve oluşturma başarılı",
  "data": {
    "analysis": "Resim analizi metni",
    "generatedImageBase64": "Base64 kodlanmış resim verisi",
    "generatedImageUrl": "https://my-love-app.s3.eu-north-1.amazonaws.com/ai-generated-1234567890-userId.png",
    "style": "kullanılan_stil",
    "additionalPrompt": "ek_prompt",
    "method": "google_gemini_image_generation"
  },
  "subscriptionInfo": {
    "planType": "kullanıcı_planı",
    "isActive": true
  }
}
```

## Kullanım Örnekleri

### 1. Basit Resim Analizi ve Çizdirme

```bash
curl -X POST http://localhost:4201/ai-chat/analyze/analyze-and-generate-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

### 2. Cartoon Stilinde Resim Oluşturma

```bash
curl -X POST http://localhost:4201/ai-chat/analyze/analyze-and-generate-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/your/image.jpg" \
  -F "style=cartoon" \
  -F "additionalPrompt=Make it more colorful and fun"
```

### 3. Anime Stilinde Resim Oluşturma

```bash
curl -X POST http://localhost:4201/ai-chat/analyze/analyze-and-generate-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/your/image.jpg" \
  -F "style=anime" \
  -F "additionalPrompt=Add magical elements"
```

## JavaScript/TypeScript Kullanımı

```typescript
const analyzeAndGenerateImage = async (imageFile: File, style: string = "realistic") => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('style', style);
    formData.append('additionalPrompt', 'Make it more artistic');

    const response = await fetch('/ai-chat/analyze/analyze-and-generate-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    
        if (result.success) {
          console.log('Analysis:', result.data.analysis);
          console.log('Generated Image Base64:', result.data.generatedImageBase64);
          console.log('Generated Image URL:', result.data.generatedImageUrl);

          // S3 URL'ini kullanarak resim göstermek için (önerilen)
          if (result.data.generatedImageUrl) {
            const imageElement = document.createElement('img');
            imageElement.src = result.data.generatedImageUrl;
            document.body.appendChild(imageElement);
          }
          
          // Alternatif: Base64'ü kullanarak resim göstermek için
          // const imageElement = document.createElement('img');
          // imageElement.src = `data:image/png;base64,${result.data.generatedImageBase64}`;
          // document.body.appendChild(imageElement);
        }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Hata Durumları

### 400 Bad Request
```json
{
  "success": false,
  "message": "Image file is required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Resim analizi ve oluşturma başarısız",
  "error": "Hata detayı"
}
```

## Gereksinimler

- Geçerli bir kullanıcı token'ı
- Aktif abonelik
- Resim dosyası (multipart/form-data)
- Google Gemini AI API anahtarı

## Notlar

- Resim dosyası doğrudan yüklenir (URL gerekmez)
- Google Gemini AI ile resim analizi yapılır
- Google Gemini'nin kendi resim oluşturma özelliği ile yeni resim oluşturulur
- Analiz süreci 10-30 saniye arasında sürebilir
- Oluşturulan resimler hem base64 hem de S3 URL formatında döner
- S3 URL'si önerilen kullanım şeklidir (daha hızlı yükleme)
- Base64 formatı alternatif olarak mevcuttur

## Limitler

- Abonelik planına göre günlük kullanım limitleri uygulanır
- Resim boyutu maksimum 10MB olmalıdır
- Desteklenen formatlar: JPEG, PNG, WebP, GIF
- Sadece resim dosyaları kabul edilir
