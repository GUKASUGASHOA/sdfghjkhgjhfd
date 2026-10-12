import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './CatalogPage.css';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');

  // Вычисляем ориентировочную дату доставки (например, через 4 дня)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data });
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }
        } else {
          console.error('Товар не найден!');
        }
      } catch (err) {
        console.error('Ошибка загрузки товара:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBuy = async () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Пожалуйста, выберите размер!');
      return;
    }

    try {
      // Сохраняем заказ в коллекцию "orders" для отслеживания
      await addDoc(collection(db, 'orders'), {
        productId: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl || '',
        selectedSize: selectedSize || 'Универсальный',
        userId: user ? user.uid : 'anonymous',
        status: 'Собирается на складе',
        deliveryDate: formattedDeliveryDate,
        createdAt: serverTimestamp(),
      });

      alert(`Спасибо за покупку! Заказ успешно оформлен. Вы можете отслеживать его в разделе "Мои заказы".`);
      navigate('/orders');
    } catch (err) {
      console.error('Ошибка при оформлении заказа:', err);
      alert('Не удалось оформить заказ. Попробуйте позже.');
    }
  };

  if (loading) return <div className="loading">Загрузка товара...</div>;
  if (!product) return <div className="loading">Товар не найден.</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div>
        <img
          src={product.imageUrl || 'https://via.placeholder.com/400?text=No+Image'}
          alt={product.title}
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }}
        />
      </div>
      <div>
        <span className="product-category">{product.category}</span>
        <h1 style={{ margin: '0.5rem 0', color: '#111827' }}>{product.title}</h1>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '1rem 0' }}>
          {product.price.toLocaleString('ru-RU')} ₽
        </p>

        {/* Блок информации о доставке */}
        <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '8px', margin: '1rem 0', border: '1px solid #e5e7eb' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#374151' }}>
            📦 <strong>Когда товар будет у вас:</strong> ориентировочно <strong>{formattedDeliveryDate}</strong>
          </p>
          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
            Бесплатная доставка до пункта выдачи.
          </p>
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="product-tags" style={{ marginBottom: '1rem' }}>
            {product.tags.map((tag, idx) => (
              <span key={idx} className="tag-badge">#{tag}</span>
            ))}
          </div>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div style={{ margin: '1.5rem 0' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Выберите размер:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: selectedSize === size ? '2px solid #4f46e5' : '1px solid #d1d5db',
                    backgroundColor: selectedSize === size ? '#e0e7ff' : '#fff',
                    color: selectedSize === size ? '#3730a3' : '#374151',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.description && (
          <div style={{ margin: '1.5rem 0' }}>
            <h3 style={{ fontSize: '1rem', color: '#374151', marginBottom: '0.3rem' }}>Описание:</h3>
            <p style={{ color: '#6b7280', lineHeight: '1.5' }}>{product.description}</p>
          </div>
        )}

        <button
          onClick={handleBuy}
          style={{
            width: '100%',
            padding: '0.8rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          Купить товар
        </button>
      </div>
    </div>
  );
};