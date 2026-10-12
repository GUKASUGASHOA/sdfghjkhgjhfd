const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Инициализация Firebase Admin SDK
// Скачайте файл ключа (serviceAccountKey.json) в настройках проекта Firebase:
// Настройки проекта -> Сервисные аккаунты -> Создать новый закрытый ключ
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- ЭНДПОИНТЫ API ---

// 1. Получить список всех товаров (GET /api/products)
app.get('/api/products', async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(products);
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Получить один товар по ID (GET /api/products/:id)
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('products').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('Ошибка при получении товара:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Создать новый товар (POST /api/products)
app.post('/api/products', async (req, res) => {
  try {
    const { title, price, category, description, imageUrl, sizes, tags, userId } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ error: 'Обязательные поля: title, price, category' });
    }

    const newProduct = {
      title,
      price: Number(price),
      category,
      description: description || '',
      imageUrl: imageUrl || '',
      sizes: sizes || [],
      tags: tags || [],
      userId: userId || 'anonymous',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('products').add(newProduct);
    res.status(201).json({ id: docRef.id, ...newProduct });
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Оформить заказ (POST /api/orders)
app.post('/api/orders', async (req, res) => {
  try {
    const { productId, title, price, imageUrl, selectedSize, userId, deliveryDate } = req.body;

    const newOrder = {
      productId,
      title,
      price: Number(price),
      imageUrl: imageUrl || '',
      selectedSize: selectedSize || 'Универсальный',
      userId: userId || 'anonymous',
      status: 'Собирается на складе',
      deliveryDate: deliveryDate || 'Скоро',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('orders').add(newOrder);
    res.status(201).json({ id: docRef.id, message: 'Заказ успешно создан', ...newOrder });
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Получить заказы пользователя (GET /api/orders?userId=XYZ)
app.get('/api/orders', async (req, res) => {
  try {
    const { userId } = req.query;
    let q = db.collection('orders');
    
    if (userId) {
      q = q.where('userId', '==', userId);
    }

    const snapshot = await q.get();
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(orders);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер интернет-магазина запущен на порту ${PORT}`);
});