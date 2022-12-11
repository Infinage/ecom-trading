import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import { NavLink, useNavigate } from 'react-router-dom';
import login from '../assets/login.svg';
import orderImg from '../assets/order.svg';

const Order = () => {
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user);
  const orderState = useSelector((state) => state.order);

  const [show, setShow] = useState(false);

  useEffect(
    () => {
      let timer1 = setTimeout(() => setShow(true), 500);

      // this will clear Timeout
      // when component unmount like in willComponentUnmount
      // and show will not change to true
      return () => {
        clearTimeout(timer1);
      };
    },
    // useEffect will run only one time with empty []
    // if you pass a value to array,
    // like this - [data]
    // than clearTimeout will run every time
    // this value changes (useEffect re-run)
    []
  );
  
  const Loading = () => {
    return (
      <>
        <div className="col-md-4 mx-2 px-2">
          <Skeleton height={400} />
        </div>
        {''}
        <div className="col-md-8 mx-2 px-2">
          <Skeleton height={300} />
        </div>
      </>
    );
  };
  const NoUser = () => {
    const handleClick = () => {
      navigate('/login');
    };

    return (
      <div>
        <div className="row  bg-light" style={{ padding: '20px' }}>
          <div className="col-md-8">
            <div className="align-items-end d-flex flex-column justify-content-center">
              <div className="container">
                <h5 className="card-title display-4 fw-bolder mb-0">
                  LOGIN TO CHECK ORDERS
                </h5>
              </div>
            </div>
          </div>
          <br />
          <div className="col-md-4">
            <img
              src={login}
              className="align-items-end"
              alt="Background"
              style={{
                maxWidth: '100%',
                height: 'auto',
                padding: '10px',
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container " style={{ padding: '20px', display: 'flex' }}>
      {userState === null || userState == [] ? (
        <NoUser />
      ) : !show ? (
        <Loading />
      ) : (
        <div className="row">
          <div className="col-md-4">
            <img
              src={orderImg}
              className="align-items-end"
              alt="Background"
              style={{
                maxWidth: '100%',
                height: 'auto',
                padding: '10px',
              }}
            />
          </div>
          <br />
          <div className="col-md-8">
            <div className="align-items-end d-flex flex-column justify-content-center">
              <div className="container">
                <div className="card">
                  <div className="card-header bg-success text-light d-flex align-items-center">
                  <NavLink to="/" className="text-decoration-none link-light">
                    <i className="fa fa-2x fa-home me-2" aria-hidden="true"></i>
                    Go Home
                  </NavLink>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">Products</h3>
                    <p className="card-text">Hurray! Your order has been placed. Here is your list of products:</p>
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th scope="col">Product Name</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Price</th>
                          </tr>
                        </thead>

                        <tbody>
                          {orderState.order.map(
                            (product) => (
                              <tr key={product._id}>
                                <td>{product.title}</td>
                                <td>{product.quantity}</td>
                                <td>$ {product.price}</td>
                              </tr>
                            )
                          )}
                        </tbody>

                        <tfoot>
                          <tr>
                            <td>Total</td>
                            <td>{orderState.quantity}</td>
                            <td>$ {Math.round(orderState.cost * 100) / 100}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Order;
