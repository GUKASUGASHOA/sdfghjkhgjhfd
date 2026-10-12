import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import './CatalogPage.css';

export const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTag, setSearchTag] = useState(''); // Состояние для поиска по тегу

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      } catch (err) {
        console.error('Ошибка при загрузке каталога:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Фильтруем товары по названию, категории или тегам
  const filteredProducts = products.filter((product) => {
    const query = searchTag.toLowerCase().trim();
    if (!query) return true;

    const matchTitle = product.title?.toLowerCase().includes(query);
    const matchCategory = product.category?.toLowerCase().includes(query);
    const matchTags = product.tags && product.tags.some((tag) => tag.toLowerCase().includes(query));

    return matchTitle || matchCategory || matchTags;
  });

  return (
    <div className="catalog-container">
      <h2>Каталог товаров</h2>

      {/* Поле поиска */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Поиск по тегу (например: зима, оверсайз) или названию..."
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
      </div>

      {loading ? (
        <div className="loading">Загрузка каталога...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="loading">Товары не найдены.</div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <img
                  src={product.imageUrl || 'https://via.placeholder.com/300?text=No+Image'}
                  alt={product.title}
                  className="product-image"
                />
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-title">{product.title}</h3>
                  <p className="product-price">{product.price.toLocaleString('ru-RU')} ₽</p>
                  
                  {product.tags && product.tags.length > 0 && (
                    <div className="product-tags">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="tag-badge">#{tag}</span>
                      ))}
                    </div>
                  )}

                  {product.sizes && product.sizes.length > 0 && (
                    <div className="product-sizes" style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 600, color: '#374151' }}>Размеры: </span>
                      <span style={{ color: '#4b5563' }}>{product.sizes.join(', ')}</span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};