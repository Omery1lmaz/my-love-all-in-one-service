# AI Chat Streaming Implementation

Bu dokümantasyon, AI chat sistemine eklenen streaming özelliğini açıklar.

## Yeni Özellikler

### 1. Streaming AI Functions
- `chatWithGoogleAIStream()` - Genel AI sohbeti için streaming
- `chatWithGoogleLifeCoachStream()` - Yaşam koçu sohbeti için streaming

### 2. Streaming Controller
- `sendMessageStream()` - Streaming mesaj gönderme controller'ı

### 3. Yeni API Endpoint
- `POST /api/ai-chat/sessions/:sessionId/messages/stream` - Streaming mesaj gönderme

## Kullanım

### Normal Mesaj Gönderme (Mevcut)
```javascript
POST /api/ai-chat/sessions/:sessionId/messages
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "Merhaba, nasılsın?"
}
```

### Streaming Mesaj Gönderme (Yeni)
```javascript
POST /api/ai-chat/sessions/:sessionId/messages/stream
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "Merhaba, nasılsın?"
}
```

**Response:** `text/plain` formatında chunked streaming response

## Frontend Kullanımı

### JavaScript Fetch API ile
```javascript
async function sendStreamingMessage(sessionId, message, token) {
  const response = await fetch(`/api/ai-chat/sessions/${sessionId}/messages/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    console.log('Received chunk:', chunk);
    // UI'da göster
  }
}
```

### React ile
```jsx
const [streamingResponse, setStreamingResponse] = useState('');

const sendStreamingMessage = async (sessionId, message) => {
  setStreamingResponse('');
  
  const response = await fetch(`/api/ai-chat/sessions/${sessionId}/messages/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    setStreamingResponse(prev => prev + chunk);
  }
};
```

## Avantajlar

1. **Gerçek Zamanlı Yanıt**: Kullanıcı AI'nın yanıtını yazdığını görebilir
2. **Daha İyi UX**: Uzun yanıtlar için bekleme süresi azalır
3. **Performans**: Büyük yanıtlar için daha iyi performans
4. **Geriye Uyumluluk**: Mevcut API'ler çalışmaya devam eder

## Teknik Detaylar

- Google Gemini AI'nın `sendMessageStream()` API'si kullanılır
- Response headers: `text/plain; charset=utf-8`
- Chunked transfer encoding kullanılır
- Hata durumlarında uygun error mesajları stream edilir
- Session'lar normal şekilde güncellenir

## Test

Streaming fonksiyonlarını test etmek için:

```bash
node test-streaming.js
```

Bu test, Google AI streaming fonksiyonunu test eder ve sonuçları konsola yazdırır.
