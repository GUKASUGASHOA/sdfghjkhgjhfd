import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './AuthPage.css';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Поля для адреса
  const [address, setAddress] = useState({
    city: '',
    street: '',
    house: '',
    apartment: '',
    postalCode: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Создаем пользователя в Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Сохраняем адрес продавца в Firestore (коллекция 'users')
      const fullAddressString = `${address.city}, ул. ${address.street}, д. ${address.house}${address.apartment ? `, кв. ${address.apartment}` : ''}`;
      
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        address: {
          city: address.city,
          street: address.street,
          house: address.house,
          apartment: address.apartment,
          postalCode: address.postalCode,
          fullAddress: fullAddressString,
        },
        createdAt: new Date().toISOString(),
      });

      // Перенаправляем в личный кабинет после успешной регистрации
      navigate('/dashboard');
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      // Понятные сообщения об ошибках
      if (err.code === 'auth/email-already-in-use') {
        setError('Этот email уже занят другим аккаунтом.');
      } else if (err.code === 'auth/weak-password') {
        setError('Пароль слишком простой (минимум 6 символов).');
      } else {
        setError(`Ошибка регистрации: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleRegister} className="auth-form">
        <h2>Регистрация продавца</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="example@mail.com"
          />
        </div>

        <fieldset className="address-fieldset">
          <legend>Точный адрес доставки / отправки</legend>
          
          <div className="form-group">
            <label htmlFor="city">Город *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={address.city}
              onChange={handleInputChange}
              required
              placeholder="Москва"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="street">Улица *</label>
              <input
                type="text"
                id="street"
                name="street"
                value={address.street}
                onChange={handleInputChange}
                required
                placeholder="Ленина"
              />
            </div>
            <div className="form-group house-group">
              <label htmlFor="house">Дом *</label>
              <input
                type="text"
                id="house"
                name="house"
                value={address.house}
                onChange={handleInputChange}
                required
                placeholder="10к1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="apartment">Квартира / Офис</label>
              <input
                type="text"
                id="apartment"
                name="apartment"
                value={address.apartment}
                onChange={handleInputChange}
                placeholder="45"
              />
            </div>
            <div className="form-group">
              <label htmlFor="postalCode">Почтовый индекс *</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={address.postalCode}
                onChange={handleInputChange}
                required
                placeholder="101000"
              />
            </div>
          </div>
        </fieldset>

        <div className="form-group">
          <label htmlFor="password">Пароль (мин. 6 символов) *</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
        </button>

        <p className="auth-redirect">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
};