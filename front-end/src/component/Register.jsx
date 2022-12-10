import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { userRegister } from '../redux/slices/user-slice';
import { useDispatch } from 'react-redux';
import { ErrorMessage, Field, Formik, Form } from 'formik';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div className="container" style={{ padding: '20px' }}>

      <Formik 
        initialValues={{"name": "", "email": "", "password": "", "address": "", "phone": ""}}
        validate={(values) => {
          const errors = {};
          if (!values.name) { errors.name = '* Required'; }
          if (!values.address) {errors.address = '* Required'; }

          if (!values.email) {
            errors.email = '* Required'; 
          } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)){
            errors.email = '* Invalid email address';
          }

          if (!values.password) {
            errors.password = '* Required'; 
          } else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[^a-zA-Z0-9])(?!.*\s).{7,15}$/.test(values.password)){
            errors.password = "* Weak Password"
          }
          
          if (!values.phone) {
            errors.phone = '* Required'; 
          } else if (!/^\d{10}$/.test(values.phone)){
            errors.phone = "* not a valid phone number"
          }

          return errors;
        }}
        onSubmit={async ({name, password, email, address, phone}, {resetForm, setStatus}) => {    
          const registerResult = await dispatch(
            userRegister({
              name: name,
              password: password,
              email: email,
              phone: phone,
              address: address
            })
          );

          if (registerResult.meta.requestStatus === "fulfilled"){
            navigate('/');
          } else {
            resetForm();
            setStatus({message: registerResult.payload});
          }
        }}
      >

        {({ values, handleChange, handleSubmit, setValues, isSubmitting, dirty, isValid, status }) => (
        <Form>

          <div className="mb-3">
            <label for="name" className="form-label">
              Name: <ErrorMessage name="name" component="span" className='text-danger'/>
            </label>
            <Field type="text" name="name" autoComplete="off" className="form-control"/>
          </div>

          <div className="mb-3">
            <label for="text" className="form-label">
              Email Address: <ErrorMessage name="email" component="span" className='text-danger'/>
            </label>
            <Field type="email" name="email" autoComplete="off" className="form-control"/>
          </div>

          <div className="mb-3">
            <label for="password" className="form-label">
              Password: <ErrorMessage name="password" component="span" className='text-danger'/>
            </label>
            <Field type="password" name="password" autoComplete="off" className="form-control"/>
          </div>

          <div className="mb-3">
            <label for="address" className="form-label">
              Address: <ErrorMessage name="address" component="span" className='text-danger'/>
            </label>
            <Field type="text" name="address" autoComplete="off" className="form-control"/>
          </div>

          <div className="mb-3">
            <label for="phone" className="form-label">
              Phone Number: <ErrorMessage name="phone" component="span" className='text-danger'/>
            </label>
            <Field type="text" name="phone" autoComplete="off" className="form-control"/>
          </div>

          {status && status.message && <div className='text-danger'>{status.message}</div> }

          <button type="submit" disabled={!isValid} className="btn btn-primary">
            Register
          </button>
          <NavLink to="/login" className="btn btn-dark" style={{ margin: '5px' }}>
            Already user? Sign in
          </NavLink>

        </Form>
        )}
      </Formik>
    </div>
  );
};

export default Register;
