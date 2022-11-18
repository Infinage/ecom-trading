import React from 'react';
import { useSelector } from 'react-redux';

const Checkout = () => {
  const state = useSelector((state) => state.userData);
  return (
    <div>
      <h1>Checkout</h1>
    </div>
  );
};

export default Checkout;
