import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { registerUser } from '../redux/slices/user-slice';
import { useDispatch } from 'react-redux';

const Register = () => {
  const [name, setName] = useState();
  const [password, setPassword] = useState();
  const [email, setEmail] = useState();
  const [phone, setPhone] = useState();
  const [address, setAddress] = useState();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = () => {
    dispatch(
      registerUser({
        name: name,
        password: password,
        email: email,
        phone: phone,
        address: address,
        loggedIn: false,
      })
    );
    navigate('/login');
  };
  return (
    <div className="container" style={{ padding: '20px' }}>
      <form>
        <div className="mb-3">
          <label for="exampleName" className="form-label">
            Name
          </label>
          <input
            value={name}
            type="name"
            className="form-control"
            id="exampleName"
            aria-describedby="emailHelp"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label for="exampleInputEmail1" className="form-label">
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

        <div className="mb-3">
          <label for="exampleAddress" className="form-label">
            Address
          </label>
          <input
            value={address}
            type="text"
            className="form-control"
            id="exampleAddress"
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label for="exampleTel" className="form-label">
            Phone
          </label>
          <input
            value={phone}
            type="tel"
            className="form-control"
            id="exampleTel"
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
          Register
        </button>
        <NavLink to="/login" className="btn btn-dark" style={{ margin: '5px' }}>
          Already user? Sign in
        </NavLink>
      </form>
    </div>
  );
};

export default Register;
