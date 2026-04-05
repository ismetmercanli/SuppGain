# REST API Görev Dağılımı

**REST API Adresi:** [api.suppgain.com](https://ismetmercanli-suppgainfrontend.vercel.app/)

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
```
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





