import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);

  // Состояние формы (включая теги и размеры)
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Верхняя одежда',
    description: '',
    imageUrl: '',
    isAvailable: true,
    tags: '',
    sizes: '', // Поле для размеров
  });

  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Загружаем профиль пользователя (адрес)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data());
        }
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
      }
    };
    fetchUserProfile();
  }, [user]);

  // Загружаем товары текущего пользователя
  const fetchMyProducts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(collection(db, 'products'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setMyProducts(productsData);
    } catch (err) {
      console.error('Ошибка при загрузке ваших товаров:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Вы должны быть авторизованы!');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      // Превращаем теги в массив
      const tagsArray = formData.tags
        ? formData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0)
        : [];

      // Превращаем размеры в массив
      const sizesArray = formData.sizes
        ? formData.sizes.split(',').map((size) => size.trim()).filter((size) => size.length > 0)
        : [];

      console.log('Попытка добавления товара для пользователя:', user.uid);

      // Отправляем данные в Firestore
      const docRef = await addDoc(collection(db, 'products'), {
        title: formData.title,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        imageUrl: formData.imageUrl || 'https://via.placeholder.com/300?text=No+Image',
        isAvailable: formData.isAvailable,
        tags: tagsArray,
        sizes: sizesArray, // Сохраняем размеры
        userId: user.uid,
        userEmail: user.email || 'Не указан',
        createdAt: serverTimestamp(),
      });

      console.log('Товар успешно добавлен с ID:', docRef.id);

      // Очищаем форму
      setFormData({
        title: '',
        price: '',
        category: 'Верхняя одежда',
        description: '',
        imageUrl: '',
        isAvailable: true,
        tags: '',
        sizes: '',
      });

      alert('Товар успешно добавлен!');
      fetchMyProducts();
    } catch (err) {
      console.error('Ошибка сохранения товара в Firestore:', err);
      setError(`Не удалось сохранить товар: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Удалить этот товар?')) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      setMyProducts((prev) => prev.filter((item) => item.id !== productId));
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="profile-header">
        <h2>Личный кабинет продавца</h2>
        <p>Email: <strong>{user?.email}</strong></p>
        <p>Адрес: <strong>{userProfile?.address?.fullAddress || 'Не указан'}</strong></p>
      </div>

      <div className="dashboard-content">
        <div className="add-product-card">
          <h3>Добавить товар</h3>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label>Название вещи *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Джинсы"
              />
            </div>

            <div className="form-group">
              <label>Цена (руб.) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="2500"
              />
            </div>

            <div className="form-group">
              <label>Категория *</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Верхняя одежда">Верхняя одежда</option>
                <option value="Обувь">Обувь</option>
                <option value="Брюки и джинсы">Брюки и джинсы</option>
                <option value="Толстовки и свитера">Толстовки и свитера</option>
                <option value="Аксессуары">Аксессуары</option>
              </select>
            </div>

            <div className="form-group">
              <label>Теги (через запятую)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="зима, хлопок, оверсайз"
              />
            </div>

            <div className="form-group">
              <label>Доступные размеры (через запятую)</label>
              <input
                type="text"
                name="sizes"
                value={formData.sizes}
                onChange={handleChange}
                placeholder="S, M, L, XL или 41, 42, 43"
              />
            </div>

            <div className="form-group">
              <label>Ссылка на фото</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Описание вещи..."
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
                В наличии
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Сохранение...' : 'Выставить товар'}
            </button>
          </form>
        </div>

        <div className="my-products-section">
          <h3>Мои товары ({myProducts.length})</h3>
          {loading ? (
            <p>Загрузка...</p>
          ) : myProducts.length === 0 ? (
            <p>У вас пока нет товаров.</p>
          ) : (
            <div className="my-products-grid">
              {myProducts.map((product) => (
                <div key={product.id} className="my-product-card">
                  <img src={product.imageUrl} alt={product.title} className="my-product-img" />
                  <div className="my-product-info">
                    <span className="product-category">{product.category}</span>
                    <h4>{product.title}</h4>
                    <p className="price">{product.price.toLocaleString('ru-RU')} ₽</p>
                    
                    {product.tags && product.tags.length > 0 && (
                      <div className="product-tags">
                        {product.tags.map((tag, idx) => (
                          <span key={idx} className="tag-badge">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {product.sizes && product.sizes.length > 0 && (
                      <div className="product-sizes" style={{ margin: '0.4rem 0', fontSize: '0.9rem' }}>
                        <strong>Размеры: </strong> {product.sizes.join(', ')}
                      </div>
                    )}

                    <button onClick={() => handleDelete(product.id)} className="delete-btn">
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};