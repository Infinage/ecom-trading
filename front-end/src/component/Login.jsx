import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Login = () => {
  const [name, setName] = useState();
  const [password, setPassword] = useState();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const handleSubmit = () => {
    if (user == null) {
      alert('Register First Then login');
      navigate('/register');
    } else if (user.name == name && user.password == password) {
      user.loggedIn = true;
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <form>
        <div className="mb-3">
          <label for="exampleInputEmail1" className="form-label">
            Email address
          </label>
          <input
            value={name}
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            onChange={(e) => setName(e.target.value)}
          />
          <div id="emailHelp" className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>
        <div className="mb-3">
          <label for="exampleInputPassword1" className="form-label">
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
