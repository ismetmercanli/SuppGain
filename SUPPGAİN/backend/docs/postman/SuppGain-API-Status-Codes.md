# SuppGain API Status Codes (Requirement Coverage)

Bu dokuman, istenen gereksinimler icin endpoint bazli donen HTTP kodlarini ozetler.

## Auth

- **Kayit olma** `POST /auth/register`
  - `200` basarili kayit + session
  - `400` is kurali/validation hatasi
  - `409` `EMAIL_ALREADY_EXISTS`
  - `422` model validation
- **Giris yapma** `POST /auth/login`
  - `200` basarili giris + session
  - `401` hatali kimlik bilgisi
  - `400/422` validation

## Users (Profile)

- **Profil goruntuleme** `GET /users/me`
  - `200`
  - `401` token yok/gecersiz
  - `404` user bulunamadi
- **Profil guncelleme** `PUT /users/me`
  - `200`
  - `400/422` validation
  - `401` token yok/gecersiz
  - `404` user bulunamadi
  - `409` `EMAIL_ALREADY_EXISTS`
- **Hesap silme** `DELETE /users/me`
  - `204`
  - `401` token yok/gecersiz
  - `403` forbidden
  - `404` user bulunamadi

## Products

- **Urun listeleme** `GET /products`
  - `200`
- **Urun ekleme** `POST /products`
  - `201`
  - `400/422` validation
  - `401` token yok/gecersiz
  - `409` `ALREADY_EXISTS`
- **Urun guncelleme** `PUT /products/{productId}`
  - `200`
  - `400/422` validation
  - `401` token yok/gecersiz
  - `404` `NOT_FOUND`
  - `409` `ALREADY_EXISTS`
- **Urun silme** `DELETE /products/{productId}`
  - `204`
  - `401` token yok/gecersiz
  - `404` `NOT_FOUND`

## Cart

- **Sepete urun ekleme** `POST /cart`
  - `200`
  - `400` `OUT_OF_STOCK` veya business error
  - `401` token yok/gecersiz
  - `404` `USER_NOT_FOUND` / `PRODUCT_NOT_FOUND`
  - `422` validation
- **Sepet goruntuleme** `GET /cart`
  - `200`
  - `401` token yok/gecersiz
  - `404` `USER_NOT_FOUND`

## Orders

- **Siparis olusturma** `POST /orders`
  - `201`
  - `400` `CART_EMPTY` / `PRODUCT_NOT_AVAILABLE` / `OUT_OF_STOCK`
  - `401` token yok/gecersiz
- **Siparis goruntuleme** `GET /orders/{orderId}` ve `GET /orders/me`
  - `200`
  - `401` token yok/gecersiz
  - `403` `FORBIDDEN` (baska kullanici siparisi)
  - `404` `NOT_FOUND`

## Weekly Program

- **Haftalik program olusturma** `POST /weekly-program`
  - `201`
  - `400/422` validation veya business error
  - `401` token yok/gecersiz
  - `404` `USER_NOT_FOUND`
- **Haftalik program guncelleme** `PUT /weekly-program/{programId}`
  - `200`
  - `400/422` validation
  - `401` token yok/gecersiz
  - `403` `FORBIDDEN`
  - `404` `NOT_FOUND`

> Not: Collection dosyasi: `backend/docs/postman/SuppGain-Requirements.postman_collection.json`
