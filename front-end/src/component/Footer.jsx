import React from 'react';
import { useState, useEffect } from 'react';

const Footer = () => {

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getCategories = async () => {
      const categoryResp = await fetch(`/api/v1/products/category`);
      setCategories((await categoryResp.json())['data']);
    }

    getCategories();
  }, [])

  return (
    <div className="foot">
      <footer className=" row text-center text-lg-start bg-dark text-muted">
        <section className="d-flex flexwrap justify-content-center justify-content-lg-between p-4 border-bottom">
          <div className="me-5 d-none d-lg-block">
            <span>Get connected with us on social networks:</span>
          </div>

          <div>
            <a href="" className="me-4 text-reset">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="" className="me-4 text-reset">
              <i className="bi bi-twitter"></i>
            </a>
            <a href="" className="me-4 text-reset">
              <i className="bi bi-google"></i>
            </a>
            <a href="" className="me-4 text-reset">
              <i className="bi bi-instagram"></i>
            </a>
          </div>
        </section>

        <section className="">
          <div className="container text-center text-md-start mt-5">
            <div className="row mt-3">
              <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">
                  <i className="fa fa-diamond"></i> E-Cart Shop
                </h6>
                <p>
                  Buy the products you love & Sell the products that you once loved.
                </p>
              </div>

              <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">Products</h6>
                {categories.map(cat => (
                  <p key={cat}>
                    <a href={`#/products?category=${cat}`} className="text-reset text-decoration-none">
                      {cat}
                    </a>
                  </p>
                ))}
              </div>

              <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">Useful links</h6>
                <p>
                  <a href="#/contact" className="text-reset text-decoration-none">
                    Contact Us
                  </a>
                </p>
                <p>
                  <a href="#/register" className="text-reset text-decoration-none">
                    Register
                  </a>
                </p>
                <p>
                  <a href="#/products" className="text-reset text-decoration-none">
                    Products
                  </a>
                </p>
              </div>

              <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                <h6 className="text-uppercase fw-bold mb-4">Contact</h6>
                <p>
                  <i className="bi bi-house-door-fill me-3"></i> Chennai, India
                </p>
                <p>
                  <i className="bi bi-envelope me-3"></i>
                  query@deesa.com
                </p>
                <p>
                  <i className="bi bi-phone me-3"></i> +91 987654321
                </p>
              </div>
            </div>
          </div>
        </section>
        <div
          className="text-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
        >
          © 2022 Copyright: &nbsp;
          <a
            className="text-reset text-decoration-none"
            href="https://github.com/Infinage"
          >
            Deesa Consulting Services
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
