import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './AddProductPage.css';

export const AddProductPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Верхняя одежда',
    description: '',
    imageUrl: '',
    isAvailable: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Сохраняем товар в коллекцию "products" в Firebase Cloud Firestore
      await addDoc(collection(db, 'products'), {
        title: formData.title,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        imageUrl: formData.imageUrl || 'https://via.placeholder.com/300',
        isAvailable: formData.isAvailable,
        userId: user ? user.uid : 'anonymous', // Привязка к текущему пользователю
        createdAt: serverTimestamp(),
      });

      alert('Товар успешно выставлен на продажу и сохранён в Firebase!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError('Не удалось сохранить товар в облачную базу данных.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Продать свою вещь (Firebase)</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="title">Название вещи *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Например: Джинсы Levi's"
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Цена (руб.) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            placeholder="2500"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Категория *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Верхняя одежда">Верхняя одежда</option>
            <option value="Обувь">Обувь</option>
            <option value="Брюки и джинсы">Брюки и джинсы</option>
            <option value="Толстовки и свитера">Толстовки и свитера</option>
            <option value="Аксессуары">Аксессуары</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Ссылка на изображение</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание товара</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Укажите размер, состояние вещи и другие подробности..."
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
            />
            В наличии (готов к продаже)
          </label>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Сохранение в облако...' : 'Выставить на продажу'}
        </button>
      </form>
    </div>
  );
};