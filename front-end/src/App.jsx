import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import './style.css';

import Home from './component/Home';
import Navbar from './component/Navbar';

import Products from './component/Products';
import Product from './component/Product';
import Cart from './component/Cart';
import Footer from './component/Footer';
import Checkout from './component/Checkout';
import Login from './component/Login';
import Register from './component/Register';
import Shipping from './component/Shipping';
import Order from './component/Order';
import Contact from './component/Contact';

function App() {
  return (
    <>
      <Navbar />
        <Routes>
          <Route exact path="/" element={ <Home /> } />
          <Route exact path="/products" element={ <Products /> } />
          <Route exact path="/products/:id" element={ <Product /> } />
          <Route exact path="/cart" element={ <Cart /> } />
          <Route exact path="/checkout" element={ <Checkout /> } />
          <Route exact path="/login" element={ <Login /> } />
          <Route exact path="/register" element={ <Register /> } />
          <Route exact path="/shipping" element={ <Shipping /> } />
          <Route exact path="/order" element={ <Order /> } />
          <Route exact path="/contact" element={ <Contact /> } />
        </Routes>
      <Footer />
    </>
  );
}

export default App;
