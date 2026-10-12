import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import './HomePage.css';

export const HomePage = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const q = query(collection(db, 'products'), limit(4));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLatestProducts(productsData);
      } catch (err) {
        console.error('Ошибка при загрузке товаров для главной:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  return (
    <div className="home-page">
      <section className="hero-banner">
        <h1>Добро пожаловать в StyleStore</h1>
        <p>
          Современная площадка для покупки и управления коллекциями одежды.
          Исследуйте наш каталог или выставляйте свои вещи на продажу в личном кабинете!
        </p>
        <div className="hero-buttons">
          <Link to="/catalog" className="btn btn-primary">
            Перейти в каталог
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            Личный кабинет
          </Link>
        </div>
      </section>

      <section className="features-section">
        <h2>Возможности платформы</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📦 Полноценный CRUD</h3>
            <p>Управляйте своими товарами: создавайте, просматривайте и удаляйте позиции.</p>
          </div>
          <div className="feature-card">
            <h3>🔒 Авторизация</h3>
            <p>Защищённый личный кабинет продавца с привязкой товаров к вашему аккаунту.</p>
          </div>
          <div className="feature-card">
            <h3>☁️ Облачное хранение</h3>
            <p>Все данные надежно хранятся в Firebase и не пропадут при перезагрузке.</p>
          </div>
        </div>
      </section>

      <section className="products-preview-section">
        <h2>Недавно добавленные вещи</h2>
        
        {loading ? (
          <p className="loading-text">Загрузка товаров...</p>
        ) : latestProducts.length === 0 ? (
          <p className="empty-text">Пока нет добавленных товаров. Зайдите в личный кабинет и добавьте первый товар!</p>
        ) : (
          <div className="products-grid">
            {latestProducts.map((product) => (
              <div key={product.id} className="product-card">
                {/* Обертка Link для перехода на отдельную страницу товара */}
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <img 
                    src={product.imageUrl || 'https://via.placeholder.com/300'} 
                    alt={product.title} 
                    className="product-image" 
                  />
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-price">{product.price.toLocaleString('ru-RU')} ₽</p>
                    
                    {/* Отображение тегов */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="product-tags">
                        {product.tags.map((tag, index) => (
                          <span key={index} className="tag-badge">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Отображение размеров */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="product-sizes" style={{ margin: '0.4rem 0', fontSize: '0.9rem' }}>
                        <strong>Размеры: </strong> {product.sizes.join(', ')}
                      </div>
                    )}

                    <span className={`status-badge ${product.isAvailable ? 'in-stock' : 'out-of-stock'}`}>
                      {product.isAvailable ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};