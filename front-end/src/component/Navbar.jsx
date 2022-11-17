import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userLogout } from '../redux/slices/user-slice';

const Navbar = () => {
  const cartState = useSelector((state) => state.cart);
  const userState = useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(userLogout());
    navigate("/login");
  }

  return (
    <div>
      <nav className="navbar navbar-expand-sm navbar-light bg-light  py-3 bg-dark ">
        <NavLink className="navbar-brand fw-bold fs-4 text-light px-3" to="/">
          E-Cart Shop
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                className="nav-link active text-light"
                aria-current="page"
                to="/"
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link text-light" to="/products">
                Products
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link text-light" to="/contact">
                Contact
              </NavLink>
            </li>
          </ul>
          <div className="buttons">
            {
              userState.user == null ? 
              <NavLink to="/login" className="btn btn-outline-dark text-light">
              <i className="fa fa-sign-in me-1"></i>Login</NavLink>
              : 
              <div className="btn btn-outline-dark text-light" onClick={handleLogout}>
              <i className="fa fa-sign-in me-1"></i>{' ' + userState.user.name}</div>
            }
            <NavLink
              to="/cart"
              className="btn btn-outline-dark ms-2 text-light"
            >
              <i className="fa fa-shopping-cart me-1"></i> Cart ({cartState.length})
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
