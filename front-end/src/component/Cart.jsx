import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { addCart, delCart } from '../redux/slices/cart-slice';

import cart from '../assets/cart.svg';

const Cart = () => {
  const cartState = useSelector((state) => state.cart);
  const userState = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleAdd = (item) => {
    dispatch(addCart(item));
  };
  const handleDel = (item) => {
    dispatch(delCart(item));
  };

  const emptyCart = () => {
    return (
      <div>
        <div className="row  bg-light" style={{ padding: '20px' }}>
          <div className="col-md-8">
            <div className="align-items-end d-flex flex-column justify-content-center">
              <div className="container">
                <h5 className="card-title display-4 fw-bolder mb-0">
                  YOUR CART IS EMPTY
                </h5>
                <p className="card-text lead fs-3">
                  <NavLink to="/products" className="text-decoration-none link-dark">CHECK OUT ALL THE TRENDS</NavLink>
                </p>
              </div>
            </div>
          </div>
          <br />
          <div className="col-md-4">
            <img
              src={cart}
              className="align-items-end"
              alt="Background"
              style={{
                maxWidth: '100%',
                height: 'auto',
                padding: '10px',
              }}
            />
          </div>
        </div>
      </div>
    );
  };
  const cartItems = () => {
    return (
        <div className="container">
          <div className="row" style={{ padding: '10px' }}>
            <h3>Cart Items</h3>
            <div className="col-12">
              <table className="table table-image">
                <thead>
                  <tr>
                    <th scope="col">Image</th>
                    <th scope="col">Product Name</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Price</th>
                    <th scope="col">Total</th>
                    <th scope="col">Add/Del</th>
                  </tr>
                </thead>
                <tbody>
                {cartState.map((product) => (
                    <tr key={product._id}>
                      <td style={{ width: '100px' }}>
                        <img
                          src={product.image}
                          className="img-fluid img-thumbnail"
                          alt={product._id}
                        />
                      </td>
                      <td>
                        <NavLink to={`/products/${product._id}`} className="text-decoration-none link-dark">
                          {product.title} <br/>
                          {product.quantity >= product.count && <span className='badge bg-primary'>Only {product.count} in Stock</span>}
                        </NavLink>
                      </td>
                      <td>{product.quantity}</td>
                      <td>{product.price}</td>
                      <td>{product.quantity * product.price}</td>
                      <td>
                        <button
                          className={`btn btn-outline-primary mx-2 px-2 ${product.quantity >= product.count? 'disabled': ''}`}
                          onClick={() => handleAdd(product)}
                        >
                          <i className="fa fa-plus"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger mx-2 px-2"
                          onClick={() => handleDel(product)}
                        >
                          <i className="fa fa-minus"></i>
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    );
  };
  const buttons = () => {
    return (
      <>
        <div className="container">
          <div className="row">
            {userState.user != null ? (
              <NavLink
                to="/shipping"
                className={`btn btn-outline-dark mb-5 w-25 mx-auto ${cartState.some(prod => prod.quantity > prod.count)? 'disabled': ''}`}
              >
                Checkout
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="btn btn-outline-dark mb-5 w-25 mx-auto"
              >
                Checkout
              </NavLink>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div>
      {cartState.length === 0 && emptyCart()}
      {cartState.length !== 0 && cartItems()}
      {cartState.length !== 0 && buttons()}
    </div>
  );
};

export default Cart;
