import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './CatalogPage.css';

export const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      } catch (err) {
        console.error('Ошибка загрузки заказов:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return <div className="loading">Пожалуйста, войдите в систему, чтобы просматривать заказы.</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Мои заказы и отслеживание</h2>

      {loading ? (
        <div className="loading">Загрузка заказов...</div>
      ) : orders.length === 0 ? (
        <div className="loading">У вас пока нет активных заказов.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Заказ № {order.id.slice(0, 8)}</span>
                  <div style={{ fontWeight: 'bold', color: '#111827' }}>{order.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      backgroundColor: '#e0e7ff',
                      color: '#3730a3',
                    }}
                  >
                    {order.status || 'В пути'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={order.imageUrl || 'https://via.placeholder.com/100'}
                  alt={order.title}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0.2rem 0', color: '#374151' }}>
                    <strong>Цена:</strong> {order.price.toLocaleString('ru-RU')} ₽
                  </p>
                  <p style={{ margin: '0.2rem 0', color: '#374151' }}>
                    <strong>Размер:</strong> {order.selectedSize || 'Не указан'}
                  </p>
                  <p style={{ margin: '0.2rem 0', color: '#374151' }}>
                    📦 <strong>Ориентировочная доставка:</strong> {order.deliveryDate}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};