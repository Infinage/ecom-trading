import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bs-stepper/dist/css/bs-stepper.min.css';
import Stepper from 'bs-stepper';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { handleOrder } from '../redux/slices/order-slice';
import { delTotCart } from '../redux/slices/cart-slice';
import { getUser } from '../services/user-auth';

const Shipping = () => {
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user);
  const cartState = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const [step, setStep] = useState(null);

  useEffect(() => {
    
    // Populate the user name, address, phone from the DB
    getUser(userState.user.id).then(resp => {
      if (resp._id){
        document.getElementById("exampleAddress").value = resp['address'];
        document.getElementById("examplePhone").value = resp['phone'];
        document.getElementById("exampleName").value = resp['name'];
      }
    });

    var stepper = new Stepper(document.querySelector('#stepper1'), {
      linear: false,
      animation: true,
    });
    setStep(stepper);
    
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    document.getElementsByClassName("step-trigger")[1].click();
  };

  const handleSubmit = () => {
    dispatch(handleOrder(cartState));
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
          <form>
            <div id="test-l-1" className="content">
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="exampleAddress"
                  placeholder="Enter Address"
                  value={userState.address}
                />
                <br />
                <label htmlFor="phone">Phone</label>
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
                <label htmlFor="exampleName">Name on card</label>
                <input
                  type="text"
                  className="form-control"
                  id="exampleName"
                  placeholder="Name"
                />
                <br />
                <label htmlFor="exampleCard">Credit Card number</label>
                <input
                  type="number"
                  className="form-control"
                  id="examplePassword"
                  placeholder="Credit Card Number"
                />
                <br />
                <label htmlFor="exampleExpiration">Expiration</label>
                <input
                  type="number"
                  className="form-control"
                  id="exampleExpiry"
                  placeholder="MM/YY"
                />
                <br />
                <label htmlFor="exampleName">CVV</label>
                <input
                  type="number"
                  className="form-control"
                  id="exampleCVV"
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
