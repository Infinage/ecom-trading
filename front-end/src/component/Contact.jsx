import React, { useRef } from 'react';
import contact from '../assets/contact.svg';
const { Toast } = bootstrap;

const Contact = () => {
  const toastRef = useRef();

  const handleClick = () => {
    var myToast = toastRef.current;
    var bsToast = new Toast(myToast, { autohide: true });
    bsToast.show();
  };

  return (
    <div>
      <div className="row  bg-dark" style={{ padding: '20px' }}>
        <div className="col-md-8">
          <div className="align-items-end d-flex flex-column justify-content-center">
            <div className="container">
              <h5 className="card-title text-light display-4 fw-bolder mb-0">
                ANY QUERIES
              </h5>
              <p className="card-text lead fs-3 text-light">CONTACT US</p>
            </div>
          </div>
        </div>
        <br />
        <div className="col-md-4">
          <img
            src={contact}
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

      <div className="container" style={{ padding: '20px', border: 'black' }}>
        <label for="exampleName">Name</label>
        <input
          type="text"
          className="form-control"
          id="exampleName"
          placeholder="Enter Name"
        />
        <br />
        <label for="exampleCard">Email</label>
        <input
          type="email"
          className="form-control"
          id="exampleEmail"
          placeholder="Enter Email"
        />
        <br />
        <label for="exampleExpiration">Mobile</label>
        <input
          type="number"
          className="form-control"
          id="exampleMobile"
          placeholder="Enter Mobile"
        />
        <br />
        <label for="exampleName">Query</label>
        <input
          type="text"
          className="form-control"
          id="exampleQuery"
          placeholder="Enter Query"
        />
        <br />

        <button className="btn btn-dark" onClick={handleClick}>
          Submit
        </button>

        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: '11' }}>
          <div
            id="liveToast"
            className="toast hide"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            ref={toastRef}
          >
            <div className="toast-header">
              <i className="bi bi-award-fill"></i>
              <strong className="me-auto">Thanks</strong>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="toast"
                aria-label="Close"
              ></button>
            </div>
            <div className="toast-body">We Will Process the Query ASAP.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
