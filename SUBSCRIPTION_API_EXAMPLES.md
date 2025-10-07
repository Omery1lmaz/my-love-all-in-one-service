# 🚀 Subscription API Kullanım Örnekleri

Bu dokümantasyon, Subscription API'sini nasıl kullanacağınızı gösteren pratik örnekler içerir.

## 📋 İçindekiler

1. [Temel Kullanım](#temel-kullanım)
2. [Plan Yönetimi](#plan-yönetimi)
3. [Hata Yönetimi](#hata-yönetimi)
4. [JavaScript/TypeScript Örnekleri](#javascripttypescript-örnekleri)
5. [cURL Örnekleri](#curl-örnekleri)
6. [Postman Collection](#postman-collection)

## 🔧 Temel Kullanım

### 1. Kullanıcının Subscription'ını Getir

```javascript
// JavaScript/TypeScript
const getUserSubscription = async (token) => {
  try {
    const response = await fetch('/subscription', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Subscription:', data.subscription);
      return data.subscription;
    } else {
      console.error('Error:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

// Kullanım
const token = 'your-jwt-token';
getUserSubscription(token);
```

```bash
# cURL
curl -X GET "http://localhost:3000/subscription" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json"
```

### 2. Mevcut Planları Listele

```javascript
const getAvailablePlans = async () => {
  try {
    const response = await fetch('/subscription/plans', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Available plans:', data.plans);
      return data.plans;
    } else {
      console.error('Error:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

// Kullanım
getAvailablePlans();
```

## 📊 Plan Yönetimi

### 1. Plan Yükseltme

```javascript
const upgradeToPremium = async (token) => {
  try {
    const response = await fetch('/subscription', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planType: 'premium',
        autoRenew: true,
        paymentMethod: 'credit_card',
        price: 9.99,
        currency: 'USD'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Plan upgraded successfully:', data.subscription);
      return data.subscription;
    } else {
      console.error('Upgrade failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

// Kullanım
upgradeToPremium(token);
```

### 2. Plan İptal Etme

```javascript
const cancelSubscription = async (token) => {
  try {
    const response = await fetch('/subscription', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Subscription cancelled:', data.message);
      console.log('New plan:', data.subscription.planType);
      return data.subscription;
    } else {
      console.error('Cancellation failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

// Kullanım
cancelSubscription(token);
```

### 3. Auto-renew Ayarlama

```javascript
const updateAutoRenew = async (token, autoRenew) => {
  try {
    const response = await fetch('/subscription', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        autoRenew: autoRenew
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Auto-renew updated:', data.subscription.autoRenew);
      return data.subscription;
    } else {
      console.error('Update failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

// Kullanım
updateAutoRenew(token, false); // Auto-renew'u kapat
updateAutoRenew(token, true);  // Auto-renew'u aç
```

## 🚨 Hata Yönetimi

### 1. Kapsamlı Hata Yönetimi

```javascript
const handleSubscriptionError = (error, response) => {
  if (!response.ok) {
    switch (response.status) {
      case 400:
        console.error('Bad Request:', error.message);
        // Validation hatası - kullanıcıya uygun mesaj göster
        break;
      case 401:
        console.error('Unauthorized:', error.message);
        // Token geçersiz - login sayfasına yönlendir
        break;
      case 404:
        console.error('Not Found:', error.message);
        // Subscription bulunamadı
        break;
      case 500:
        console.error('Server Error:', error.message);
        // Sunucu hatası - tekrar dene
        break;
      default:
        console.error('Unknown Error:', error.message);
    }
  }
};

const safeSubscriptionUpdate = async (token, updateData) => {
  try {
    const response = await fetch('/subscription', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.subscription };
    } else {
      handleSubscriptionError(data, response);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};
```

### 2. Retry Mekanizması

```javascript
const retrySubscriptionOperation = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Kullanım
const result = await retrySubscriptionOperation(() => 
  upgradeToPremium(token)
);
```

## 📱 React/React Native Örnekleri

### 1. React Hook

```javascript
import { useState, useEffect } from 'react';

const useSubscription = (token) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubscription(data.subscription);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/subscription', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubscription(data.subscription);
        return { success: true, data: data.subscription };
      } else {
        setError(data.message);
        return { success: false, error: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubscription();
    }
  }, [token]);

  return {
    subscription,
    loading,
    error,
    updateSubscription,
    refetch: fetchSubscription
  };
};

// Kullanım
const MyComponent = () => {
  const { subscription, loading, error, updateSubscription } = useSubscription(token);

  const handleUpgrade = async () => {
    const result = await updateSubscription({
      planType: 'premium',
      autoRenew: true
    });
    
    if (result.success) {
      alert('Plan upgraded successfully!');
    } else {
      alert(`Upgrade failed: ${result.error}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Current Plan: {subscription?.planType}</h2>
      <button onClick={handleUpgrade}>Upgrade to Premium</button>
    </div>
  );
};
```

### 2. React Native Örnek

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

class SubscriptionService {
  constructor() {
    this.baseURL = 'https://your-api-domain.com';
  }

  async getToken() {
    return await AsyncStorage.getItem('authToken');
  }

  async makeRequest(endpoint, options = {}) {
    const token = await this.getToken();
    
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...defaultOptions,
      ...options
    });

    return response.json();
  }

  async getSubscription() {
    return this.makeRequest('/subscription');
  }

  async updateSubscription(data) {
    return this.makeRequest('/subscription', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async cancelSubscription() {
    return this.makeRequest('/subscription', {
      method: 'DELETE'
    });
  }

  async getAvailablePlans() {
    return this.makeRequest('/subscription/plans');
  }
}

// Kullanım
const subscriptionService = new SubscriptionService();

// React Native component'te
const SubscriptionScreen = () => {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const data = await subscriptionService.getSubscription();
        setSubscription(data.subscription);
      } catch (error) {
        console.error('Failed to load subscription:', error);
      }
    };

    loadSubscription();
  }, []);

  const handleUpgrade = async () => {
    try {
      const result = await subscriptionService.updateSubscription({
        planType: 'premium',
        autoRenew: true
      });
      
      if (result.subscription) {
        setSubscription(result.subscription);
        Alert.alert('Success', 'Plan upgraded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upgrade plan');
    }
  };

  return (
    <View>
      <Text>Current Plan: {subscription?.planType}</Text>
      <Button title="Upgrade to Premium" onPress={handleUpgrade} />
    </View>
  );
};
```

## 🧪 Test Örnekleri

### 1. Jest Test

```javascript
// subscription.test.js
import { SubscriptionService } from './subscriptionService';

describe('SubscriptionService', () => {
  let subscriptionService;
  let mockFetch;

  beforeEach(() => {
    subscriptionService = new SubscriptionService();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should get subscription successfully', async () => {
    const mockSubscription = {
      planType: 'premium',
      storageLimit: 5368709120,
      maxPhotos: 1000
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Success',
        subscription: mockSubscription
      })
    });

    const result = await subscriptionService.getSubscription();

    expect(mockFetch).toHaveBeenCalledWith('/subscription', {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });

    expect(result.subscription).toEqual(mockSubscription);
  });

  test('should handle upgrade error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid plan type'
      })
    });

    await expect(
      subscriptionService.updateSubscription({ planType: 'invalid' })
    ).rejects.toThrow('Invalid plan type');
  });
});
```

## 📋 Postman Collection

```json
{
  "info": {
    "name": "Subscription API",
    "description": "Complete subscription management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get User Subscription",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/subscription",
          "host": ["{{baseUrl}}"],
          "path": ["subscription"]
        }
      }
    },
    {
      "name": "Update Subscription",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"planType\": \"premium\",\n  \"autoRenew\": true,\n  \"paymentMethod\": \"credit_card\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/subscription",
          "host": ["{{baseUrl}}"],
          "path": ["subscription"]
        }
      }
    },
    {
      "name": "Cancel Subscription",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/subscription",
          "host": ["{{baseUrl}}"],
          "path": ["subscription"]
        }
      }
    },
    {
      "name": "Get Available Plans",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/subscription/plans",
          "host": ["{{baseUrl}}"],
          "path": ["subscription", "plans"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": "your-jwt-token-here"
    }
  ]
}
```

## 🔧 Environment Variables

```bash
# .env dosyası
SECRET_KEY=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/your-database
NODE_ENV=development
```

## 📊 Monitoring ve Analytics

```javascript
// Analytics tracking
const trackSubscriptionEvent = (event, data) => {
  // Google Analytics, Mixpanel, vb.
  console.log('Subscription Event:', event, data);
};

// Kullanım
const handleUpgrade = async () => {
  try {
    const result = await updateSubscription({
      planType: 'premium'
    });
    
    trackSubscriptionEvent('plan_upgraded', {
      from: 'free',
      to: 'premium',
      userId: result.subscription.user
    });
  } catch (error) {
    trackSubscriptionEvent('plan_upgrade_failed', {
      error: error.message,
      planType: 'premium'
    });
  }
};
```

---

**Son Güncelleme**: 2024-01-15  
**Versiyon**: 1.0.0  
**Geliştirici**: Heaven Nsoft Team
