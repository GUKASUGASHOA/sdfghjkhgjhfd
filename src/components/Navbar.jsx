import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

export const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <Link to="/">🛍️ StyleStore</Link>
      </div>
      <nav className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Главная
        </NavLink>
        <NavLink to="/catalog" className={({ isActive }) => (isActive ? 'active' : '')}>
          Каталог
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
          Личный кабинет
        </NavLink>
        <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
          Войти
        </NavLink>
      </nav>
    </header>
  );
};