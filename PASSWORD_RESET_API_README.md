# Password Reset API Documentation

Bu dokümantasyon, yeni oluşturulan şifre sıfırlama API'lerinin frontend entegrasyonu için hazırlanmıştır.

## ⚠️ Önemli Not

**`/user-reset-password` endpoint'i artık kullanıcının giriş yapmış olmasını gerektirir.** Bu endpoint e-posta parametresi almaz, bunun yerine JWT token'dan kullanıcı bilgilerini alır. Bu değişiklik güvenlik açısından daha iyi bir yaklaşımdır.

## API Endpoints

### 1. Şifre Sıfırlama Talebi Gönderme
**Endpoint:** `POST /user-reset-password`

Kullanıcının e-posta adresine şifre sıfırlama bağlantısı ve OTP kodu gönderir. Bu endpoint, kullanıcının giriş yapmış olmasını gerektirir.

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
Bu endpoint herhangi bir request body gerektirmez. Kullanıcı bilgileri JWT token'dan alınır.

#### Response
```json
{
  "message": "Şifre değiştirme bağlantısı e-posta adresinize gönderildi.",
  "data": {
    "token": "jwt_token_here"
  },
  "isSuccess": true,
  "isError": false
}
```

#### Frontend Implementation
```javascript
const requestPasswordReset = async () => {
  try {
    const token = localStorage.getItem('authToken'); // Kullanıcının mevcut auth token'ı
    
    if (!token) {
      throw new Error('Kullanıcı giriş yapmamış');
    }
    
    const response = await fetch('/user-reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.isSuccess) {
      // Kullanıcıya başarı mesajı göster
      console.log('Şifre sıfırlama e-postası gönderildi');
      // Reset token'ı sakla (gerekirse)
      localStorage.setItem('resetToken', data.data.token);
    }
    
    return data;
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    throw error;
  }
};
```

### 2. Şifre Sıfırlama Uygulama
**Endpoint:** `POST /apply-reset-password`

Kullanıcının yeni şifresini uygular. Bu endpoint, şifre sıfırlama token'ının geçerli olduğunu doğrular.

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

#### Response
```json
{
  "message": "Şifre başarıyla değiştirildi.",
  "data": {
    "token": "jwt_token_here"
  },
  "isSuccess": true,
  "isError": false
}
```

#### Frontend Implementation
```javascript
const applyPasswordReset = async (newPassword, confirmPassword) => {
  try {
    const token = localStorage.getItem('resetToken') || 
                  // URL'den token al (eğer link ile geliyorsa)
                  new URLSearchParams(window.location.search).get('token');
    
    if (!token) {
      throw new Error('Şifre sıfırlama tokenı bulunamadı');
    }
    
    const response = await fetch('/apply-reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        newPassword, 
        confirmPassword 
      })
    });
    
    const data = await response.json();
    
    if (data.isSuccess) {
      // Başarı mesajı göster
      console.log('Şifre başarıyla değiştirildi');
      // Token'ı temizle
      localStorage.removeItem('resetToken');
      // Login sayfasına yönlendir
      window.location.href = '/login';
    }
    
    return data;
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    throw error;
  }
};
```

## Tam Şifre Sıfırlama Akışı

### 1. Şifre Sıfırlama Sayfası
```javascript
// Şifre sıfırlama formu (giriş yapmış kullanıcılar için)
const PasswordResetForm = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Kullanıcının giriş yapıp yapmadığını kontrol et
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Şifre sıfırlama için önce giriş yapmalısınız!');
      return;
    }
    
    setLoading(true);
    
    try {
      await requestPasswordReset();
      alert('Şifre sıfırlama e-postası gönderildi!');
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div>
        <p>Şifre sıfırlama için önce giriş yapmalısınız.</p>
        <button onClick={() => window.location.href = '/login'}>
          Giriş Yap
        </button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <p>E-posta adresinize şifre sıfırlama bağlantısı gönderilecek.</p>
      <button type="submit" disabled={loading}>
        {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Gönder'}
      </button>
    </form>
  );
};
```

### 2. Yeni Şifre Belirleme Sayfası
```javascript
// Yeni şifre belirleme formu
const NewPasswordForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }
    
    setLoading(true);
    
    try {
      await applyPasswordReset(newPassword, confirmPassword);
      alert('Şifreniz başarıyla değiştirildi!');
    } catch (error) {
      alert('Şifre değiştirme hatası: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Yeni şifrenizi girin"
        required
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Şifrenizi tekrar girin"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
      </button>
    </form>
  );
};
```

## Hata Yönetimi

### Yaygın Hata Durumları

1. **401 Unauthorized**
   - Token geçersiz veya süresi dolmuş
   - Çözüm: Kullanıcıyı şifre sıfırlama sayfasına yönlendir

2. **400 Bad Request**
   - Şifreler eşleşmiyor
   - Kullanıcı bulunamadı
   - Token süresi dolmuş

3. **500 Internal Server Error**
   - Sunucu hatası
   - E-posta gönderim hatası

### Hata Yakalama Örneği
```javascript
const handleApiError = (error) => {
  if (error.status === 401) {
    alert('Şifre sıfırlama süreniz dolmuş. Lütfen yeni bir talep gönderin.');
    window.location.href = '/forgot-password';
  } else if (error.status === 400) {
    alert(error.message || 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.');
  } else {
    alert('Bir hata oluştu. Lütfen tekrar deneyin.');
  }
};
```

## Güvenlik Notları

1. **Token Yönetimi**
   - Token'ları localStorage'da saklayın
   - İşlem tamamlandıktan sonra token'ları temizleyin
   - HTTPS kullanın

2. **Şifre Validasyonu**
   - Minimum 8 karakter
   - Büyük/küçük harf, sayı ve özel karakter içermeli
   - Frontend'de de validasyon yapın

3. **Rate Limiting**
   - Çok fazla şifre sıfırlama talebini engelleyin
   - IP bazlı sınırlama uygulayın

## Test Senaryoları

### 1. Başarılı Şifre Sıfırlama
```javascript
// Test verileri
const testPassword = 'NewPassword123!';

// 1. Kullanıcının giriş yapmış olduğundan emin ol
const authToken = localStorage.getItem('authToken');

// 2. Şifre sıfırlama talebi gönder (e-posta parametresi gerekmez)
await requestPasswordReset();

// 3. E-postadaki token'ı kullan
// 4. Yeni şifre belirle
await applyPasswordReset(testPassword, testPassword);
```

### 2. Hata Senaryoları
```javascript
// Giriş yapmamış kullanıcı
await requestPasswordReset(); // 401 Unauthorized

// Eşleşmeyen şifreler
await applyPasswordReset('password1', 'password2');

// Süresi dolmuş token
// Token'ı 10 dakika bekletip tekrar kullan
```

## Entegrasyon Checklist

- [ ] Şifre sıfırlama sayfası oluşturuldu
- [ ] Yeni şifre belirleme sayfası oluşturuldu
- [ ] API entegrasyonu tamamlandı
- [ ] Hata yönetimi eklendi
- [ ] Loading state'leri eklendi
- [ ] Form validasyonu eklendi
- [ ] Responsive tasarım uygulandı
- [ ] Test senaryoları çalıştırıldı

## Örnek Kullanım

```javascript
// React Hook örneği
const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const sendResetRequest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await requestPasswordReset();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const applyReset = async (newPassword, confirmPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await applyPasswordReset(newPassword, confirmPassword);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    sendResetRequest,
    applyReset,
    loading,
    error
  };
};
```

Bu dokümantasyon, yeni şifre sıfırlama API'lerinin frontend entegrasyonu için gerekli tüm bilgileri içermektedir. Herhangi bir sorunuz olursa lütfen iletişime geçin.
