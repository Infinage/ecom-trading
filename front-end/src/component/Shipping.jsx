import React, { useState, useEffect } from 'react';
import 'bs-stepper/dist/css/bs-stepper.min.css';
import Stepper from 'bs-stepper';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { handleOrder } from '../redux/slices/order-slice';
import { getUser } from '../services/user-auth';
import { ErrorMessage, Field, Form, Formik } from 'formik';

const Shipping = () => {
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user);
  const cartState = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const [initialValues, setInitialValues] = useState( { name: '', address: '', phone: '', cardNo: '', expiry: '', cvv: '' });
  const [step, setStep] = useState(null);

  useEffect(() => {
    
    // Populate the user name, address, phone from the DB
    getUser(userState.user.id).then(resp => {
      if (resp._id){
        setInitialValues(oldVal => ({... oldVal, address: resp['address'], phone: resp['phone'], name: resp['name'] }))
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

          <Formik
            initialValues={initialValues}
            validateOnMount="true"
            enableReinitialize="true"
            validate={values => {
                const errors = {};

                if (!values.address) { errors.address = '* Address must be provided.'; }
                
                if (!values.phone) {
                  errors.phone = '* Phone number must be provided.'; 
                } else if (!/^\d{10}$/.test(values.phone)){
                  errors.phone = "* Not a valid phone number."
                }

                if (!values.name) {errors.name = '* Name must be provided.'; }

                if (!values.cardNo) {
                  errors.cardNo = '* Card Number must be provided'; 
                } else if (String(values.cardNo).length < 14 || String(values.cardNo).length > 16){
                  errors.cardNo = "* Not a valid card number"
                }

                if (!values.expiry) {
                  errors.expiry = '* Card Expiry must be provided.'; 
                } else if (values.expiry.slice(0, 4) < new Date().getFullYear() || (
                    values.expiry.slice(0, 4) == new Date().getFullYear() && 
                    Number(values.expiry.slice(-2)) <= new Date().getMonth())){
                  errors.expiry = '* Card has already expired.';
                }

                if (!values.cvv) {
                  errors.cvv = '* Card CVV must be provided.'; 
                } else if (!/^\d{3}$/.test(values.cvv)){
                  errors.cvv = "* Not a valid CVV number."
                }

                console.log(errors);
                return errors;
            }}

            onSubmit={(values, { resetForm }) => {
              resetForm();
              dispatch(handleOrder());
              navigate('/order');
            }}
          >

            {({ values, handleChange, handleSubmit, setValues, isSubmitting, dirty, isValid }) => (
                <Form>

                  <ErrorMessage name="title" component="div" className='text-danger'/>

                  <div id="test-l-1" className="content">
                    <div className="form-group">
                      
                      <label htmlFor="address">Address</label>&ensp;
                      <ErrorMessage name="address" component="span" className='text-danger'/>
                      <Field type="text" id="address" name="address" autoComplete="off" className="form-control" placeholder="Enter Address"/>
                      <br />

                      <label htmlFor="phone">Phone</label>&ensp;
                      <ErrorMessage name="phone" component="span" className='text-danger'/>
                      <Field type="text" id="phone" name="phone" autoComplete="off" className="form-control" placeholder="Enter Phone Number"/>
                      <br />

                    </div>
                    <br />
                    <button className="btn btn-primary" onClick={handleClick}>
                      Next
                    </button>
                  </div>

                  <div id="test-l-2" className="content">
                    <div className="form-group">
                      
                      <label htmlFor="name">Name on card</label>&ensp;
                      <ErrorMessage name="name" component="span" className='text-danger'/>
                      <Field type="text" id="name" name="name" autoComplete="off" className="form-control" placeholder="Enter your Name"/>
                      <br />

                      <label htmlFor="cardNo">Credit Card number</label>&ensp;
                      <ErrorMessage name="cardNo" component="span" className='text-danger'/>
                      <Field type="number" id="cardNo" name="cardNo" autoComplete="off" className="form-control" placeholder="Enter your Credit Card Number"/>
                      <br />

                      <label htmlFor="expiry">Card Expiry</label>&ensp;
                      <ErrorMessage name="expiry" component="span" className='text-danger'/>
                      <Field type="month" id="expiry" name="expiry" autoComplete="off" className="form-control"/>
                      <br />

                      <label htmlFor="cvv">CVV</label>&ensp;
                      <ErrorMessage name="cvv" component="span" className='text-danger'/>
                      <Field type="number" id="cvv" name="cvv" autoComplete="off" className="form-control" placeholder="XXX"/>

                    </div>

                    <button type="submit" disabled={!isValid} className="btn btn-primary mt-5">
                      Place Order
                    </button>
                  </div>

                </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
