import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { userLogin } from '../redux/slices/user-slice';

const Login = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const handleSubmit = () => {
    dispatch(userLogin({email, password}));
    navigate("/cart")
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <form>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            Email address
          </label>
          <input
            value={email}
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            onChange={(e) => setEmail(e.target.value)}
          />
          <div id="emailHelp" className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword1" className="form-label">
            Password
          </label>
          <input
            value={password}
            type="password"
            className="form-control"
            id="exampleInputPassword1"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary px-4 py-2"
          onClick={handleSubmit}
        >
          Login
        </button>

        <NavLink
          to="/register"
          className="btn btn-dark px-4 py-2"
          style={{ margin: '5px' }}
        >
          New User Register Here
        </NavLink>
      </form>
    </div>
  );
};

export default Login;
