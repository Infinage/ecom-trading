import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userLogout } from '../redux/slices/user-slice';
import { tokenUnexpired } from '../services/user-auth';
import { useEffect } from 'react';

const Navbar = () => {
  const cartState = useSelector((state) => state.cart);
  const userState = useSelector((state) => state.user);
  const offeringState = useSelector((state) => state.offering);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (userState.user && !tokenUnexpired()){
      dispatch(userLogout());
    }
  }, [])

  const handleLogout = () => {
    if (confirm("Do you wish to logout?")){
      dispatch(userLogout());
      navigate("/login");
    }
  }
  
  return (
    <div>
      <nav className="navbar navbar-expand-md bg-dark">
        <div className="container-fluid">
          <NavLink className="navbar-brand fw-bold fs-4 text-light px-3" to="/">
            E-Cart Shop
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            id="toggle-btn"
            onClick={() => {
              const thisBtn = document.getElementById("toggle-btn");
              if (thisBtn.getAttribute("data-bs-target") === "#navbarSupportedContent")
                thisBtn.setAttribute("data-bs-target", "#navbarSupportedContent.show");
              else 
                thisBtn.setAttribute("data-bs-target", "#navbarSupportedContent");
            }}
          >
            <span className="navbar-toggler-icon">
              <i className="fa fa-navicon" style={{color: "#fff", fontSize: "28px"}}></i>
            </span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 px-3">
              <li className="nav-item">
                <NavLink className="nav-link active text-light" aria-current="page" to="/">
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
                (userState.user == null || !tokenUnexpired()) ? 

                <NavLink to="/login" className="btn btn-outline-dark text-light">
                  <i className="fa fa-sign-in me-1"></i>Login
                </NavLink>
                : 
                <>
                <div className="btn btn-outline-dark text-light" onClick={handleLogout}>
                  <i className="fa fa-sign-in me-1"></i>{' ' + userState.user.name}
                </div>
                <NavLink to={`/merchant/${userState.user.id}`} className="btn btn-outline-dark text-light">
                  <i className="fa fa-shopping-basket me-1"></i> My Products ({offeringState.length})
                </NavLink>
                </>

              }
              <NavLink to="/cart" className="btn btn-outline-dark text-light">
                <i className="fa fa-shopping-cart me-1"></i> Cart ({cartState.length})
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
