import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { userLogin } from '../redux/slices/user-slice';
import { Form, Formik, ErrorMessage, Field } from 'formik';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '20px' }}>

      <Formik 
        initialValues={{"email": "", "password": ""}}
        validate={(values) => {
          const errors = {};

          if (!values.email) { 
            errors.email = '* Required'; 
          } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)){
            errors.email = '* Invalid email address';
          }

          if (!values.password) {errors.password = '* Required'; }

          return errors;
        }}
        initialStatus={undefined}

        onSubmit={async ({email, password}, {resetForm, setStatus}) => {
          const loginResult = await dispatch(userLogin({email, password}));
          if (loginResult.meta.requestStatus === "fulfilled"){
            navigate("/cart");
          } else {
            resetForm();
            setStatus({message: "The username or password entered is incorrect."});
          }
        }}
      >
        {({ values, handleChange, handleSubmit, setValues, isSubmitting, dirty, isValid, status }) => (
        <Form>

          <div className="mb-3">
            <label aria-describedby="emailHelp" className="form-label" htmlFor="email">
              Email Address: <ErrorMessage name="email" component="span" className='text-danger'/>
            </label>
            <Field type="text" name="email" autoComplete="off" className="form-control"/>
            <div id="emailHelp" className="form-text">
              We'll never share your email with anyone else.
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="password">
              Password: <ErrorMessage name="password" component="span" className='text-danger'/>
            </label>
            <Field type="password" name="password" autoComplete="off" className="form-control"/>
          </div>

          {status && status.message && <div className='text-danger'>{status.message}</div> }

          <button type="submit" disabled={!isValid} className="btn btn-primary px-4 py-2">
            Login
          </button>

          <NavLink to="/register" className="btn btn-dark px-4 py-2" style={{ margin: '5px' }}>
            New User Register Here
          </NavLink>

        </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
