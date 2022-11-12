import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bs-stepper/dist/css/bs-stepper.min.css';
import Stepper from 'bs-stepper';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { orderProduct,delTotCart } from '../redux/action';

const Shipping = () => {
  const navigate = useNavigate();
  const userState = useSelector((state) => state.handleUser);
  const state = useSelector((state) => state.handleCart);
  const dispatch = useDispatch();

  const [step, setStep] = useState(null);

  useEffect(() => {
    const getId = () => {
      var stepper = new Stepper(document.querySelector('#stepper1'), {
        linear: false,
        animation: true,
      });
      setStep(stepper);
    };
    getId();
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    setStep(step.next());
  };

  const handleSubmit = () => {
    dispatch(orderProduct(state));
    dispatch(delTotCart());
    navigate('/order');
  };

  return (
    <div>
      <div id="stepper1" className="bs-stepper container">
        <div className="bs-stepper-header">
          <div className="step" data-target="#test-l-1">
            <button className="step-trigger">
              <span className="bs-stepper-circle">1</span>
              <span className="bs-stepper-label">Address</span>
            </button>
          </div>
          <div className="line"></div>
          <div className="step" data-target="#test-l-2">
            <button className="step-trigger">
              <span className="bs-stepper-circle">2</span>
              <span className="bs-stepper-label">Payment</span>
            </button>
          </div>
        </div>
        <div className="bs-stepper-content">
          <form onSubmit={this.onSubmit}>
            <div id="test-l-1" className="content">
              <div className="form-group">
                <label for="address">Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="exampleAddress"
                  placeholder="Enter Address"
                  value={userState.address}
                />
                <br />
                <label for="phone">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  id="examplePhone"
                  placeholder="Enter Phone number"
                  value={userState.phone}
                />
              </div>
              <br />
              <button className="btn btn-primary" onClick={handleClick}>
                Next
              </button>
            </div>

            <div id="test-l-2" className="content">
              <div className="form-group">
                <label for="exampleName">Name on card</label>
                <input
                  type="text"
                  className="form-control"
                  id="exampleInputPassword1"
                  placeholder="Password"
                />
                <br />
                <label for="exampleCard">Credit Card number</label>
                <input
                  type="number"
                  className="form-control"
                  id="exampleInputPassword1"
                  placeholder="Credit Card Number"
                />
                <br />
                <label for="exampleExpiration">Expiration</label>
                <input
                  type="number"
                  className="form-control"
                  id="exampleInputPassword1"
                  placeholder="MM/YY"
                />
                <br />
                <label for="exampleName">CVV</label>
                <input
                  type="number"
                  className="form-control"
                  id="exampleInputPassword1"
                  placeholder="CVV number"
                />
              </div>

              <button className="btn btn-primary mt-5" onClick={handleSubmit}>
                Place Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
