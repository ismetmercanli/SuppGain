# REST API Görev Dağılımı

**REST API Adresi:** [api.suppgain.com](https://suppgain-production.up.railway.app/swagger/index.html)
**API Test Videosu:** [Youtube Api test videosu](https://youtu.be/4tFNi7hbN_M)

Bu dokümanda, proje ekibindeki her üyenin geliştirmekten sorumlu olduğu REST API metotları listelenmektedir.

---

# SuppGain REST API Metotları

## 1. Kayıt Olma
- **Endpoint:** `POST /auth/register`
- **Description:** Yeni bir kullanıcı hesabı oluşturur.
- **Request Body:**
```json
{
  "firstName": "Ismet",
  "lastName": "Mercanli",
  "email": "kullanici@gmail.com",
  "password": "Test123!",
  "phone": "5551112233"
}
```
Response: `200 OK`
```json
{
  "token": "<jwt-token>",
  "user": {
    "id": "GUID",
    "email": "kullanici@gmail.com",
    "role": "User"
  }
}
```

## 2. Giriş Yapma
- **Endpoint:** `POST /auth/login`
- **Description:** Kullanıcı giriş yapar ve JWT döner.
- **Request Body:**

```json
{
  "email": "kullanici@gmail.com",
  "password": "Test123!"
}
```
- Response: `200 OK`
```json
{
  "token": "<jwt-token>",
  "user": {
    "id": "GUID",
    "email": "kullanici@gmail.com",
    "role": "User"
  }
}
```
## 3. Profil Görüntüleme
- **Endpoint:** `GET /users/me`
- **Description:** Giriş yapan kullanıcının profilini getirir.
- **Request Body:**
```json
{}
```
- Response: `200 OK`
```json
{
  "id": "GUID",
  "firstName": "Ismet",
  "lastName": "Mercanli",
  "email": "kullanici@gmail.com",
  "role": "User"
}
```
## 4. Profil Güncelleme
- **Endpoint:** `PUT /users/me`
- **Description:** Giriş yapan kullanıcının profil bilgilerini günceller.
- **Request Body:**
```json
{
  "firstName": "Ismet",
  "lastName": "Mercanli",
  "phone": "5559998877"
}
```
- Response: `200 OK`
```json
{
  "id": "GUID",
  "firstName": "Ismet",
  "lastName": "Mercanli",
  "email": "kullanici@gmail.com",
  "phone": "5559998877",
  "role": "User"
}
```
## 5. Hesap Silme
- **Endpoint:** `DELETE /users/me`
- **Description:** Giriş yapan kullanıcının hesabını siler/deaktif eder.
- **Request Body:**
```json
{}
```
- Response: `200 OK`

```json
{
  "message": "Hesap silindi."
}
```
## 6. Ürün Listeleme
- **Endpoint:** `GET /products`
- **Description:** Ürünleri listeler.
- **Request Body:**
```json
{}
```
- Response: `200 OK`
```json
[
  {
    "id": "GUID",
    "name": "Whey Protein",
    "category": "Protein",
    "price": 899.9,
    "stock": 50,
    "isActive": true
  }
]
```
## 7. Ürün Ekleme (Admin)
- **Endpoint:** `POST /products`
- **Description:** Admin yeni ürün ekler.
- **Request Body:**
```json
{
  "name": "Creatine",
  "category": "Performance",
  "price": 499.9,
  "stock": 30,
  "description": "Monohydrate",
  "imageUrl": "https://example.com/creatine.png"
}
```
- Response: `200 OK`

```json
{
  "id": "GUID",
  "name": "Creatine",
  "category": "Performance",
  "price": 499.9,
  "stock": 30
}
```
## 8. Ürün Güncelleme (Admin)
- **Endpoint:** `PUT /products/{productId}`
- **Description:** Admin ürün bilgilerini günceller.
- **Request Body:**
```json
{
  "name": "Creatine Micronized",
  "category": "Performance",
  "price": 549.9,
  "stock": 28,
  "description": "Updated description",
  "imageUrl": "https://example.com/creatine-new.png"
}
```
- Response: `200 OK`
```json

  {
  "id": "GUID",
  "name": "Creatine Micronized",
  "price": 549.9,
  "stock": 28
}
```
## 9. Ürün Silme (Admin)
- **Endpoint:** `DELETE /products/{productId}`
- **Description:** Admin ürünü siler/pasif yapar.
- **Request Body:**
```
{}
```
```
- Response: `200 OK`
```
```json
{
  "message": "Ürün silindi."
}
```
## 10. Sepete Ürün Ekleme
- **Endpoint:** `POST /cart`
- **Description:** Kullanıcının sepetine ürün ekler.
- **Request Body:**
```json
{
  "productId": "GUID",
  "quantity": 2
}
```
- Response: `200 OK`
```json
{
  "id": "GUID",
  "items": [
    {
      "productId": "GUID",
      "quantity": 2
    }
  ]
}
```
## 11. Sepet Görüntüleme
- **Endpoint:** `GET /cart`
- **Description:** Kullanıcının aktif sepetini getirir.
- **Request Body:**
```json
{}
```
- Response: `200 OK`
```json
{
  "id": "GUID",
  "items": [
    {
      "productId": "GUID",
      "productName": "Whey Protein",
      "quantity": 2,
      "unitPrice": 899.9
    }
  ],
  "totalAmount": 1799.8
}
```
## 12. Sipariş Oluşturma
- **Endpoint:** `POST /orders`
- **Description:** Aktif sepetten sipariş oluşturur.
- **Request Body:**
```json
{}
```
- Response: `200 OK`
```json
{
  "orderId": "GUID",
  "status": "Created",
  "totalAmount": 1799.8
}
```
## 13. Sipariş Görüntüleme
- **Endpoint:** `GET /orders/{orderId}`
- **Description:** Sipariş detayını getirir.
- **Request Body:**
```json
{}
```
- Response: `200 OK`
```json
{
  "id": "GUID",
  "status": "Created",
  "totalAmount": 1799.8,
  "items": [
    {
      "productId": "GUID",
      "productName": "Whey Protein",
      "quantity": 2,
      "unitPrice": 899.9
    }
  ]
}
```
## 14. Haftalık Program Oluşturma
- **Endpoint:** `POST /weekly-program`
- **Description:** Kullanıcı için haftalık program oluşturur.
- **Request Body:**
```json
{
  "goal": "Kas kazanımı",
  "notes": "Pazartesi-Çarşamba-Cuma antrenman"
}
```
- Response: `200 OK`
```json
{
  "id": "GUID",
  "goal": "Kas kazanımı",
  "notes": "Pazartesi-Çarşamba-Cuma antrenman"
}
```
## 15. Haftalık Program Güncelleme
- **Endpoint:** `PUT /weekly-program/{programId}`
- **Description:** Var olan haftalık programı günceller.
- **Request Body:**
```json
{
  "goal": "Yağ yakımı",
  "notes": "Haftada 4 gün cardio + kuvvet"
}
```
- Response: `200 OK`
```json
{
  "id": "GUID",
  "goal": "Yağ yakımı",
  "notes": "Haftada 4 gün cardio + kuvvet"
}
```



