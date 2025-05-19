import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCart } from '../redux/slices/cart-slice';
import { useParams, NavLink } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const [sugProd, setSugProd] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sugLoad, setSugLoad] = useState(false);
  const [merchantSelf, setMerchantSelf] = useState(false);

  const userState = useSelector(state => state.user);
  const offeringState = useSelector(state => state.offering);

  const dispatch = useDispatch();
  const addProduct = (product) => {
    dispatch(addCart(product));
  };

  useEffect(() => {
    const getProduct = async () => {

      setLoading(true);
      setSugLoad(true);

      let prod = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/${id}`);
      prod = await prod.json();
      setMerchantSelf(userState.user && userState.user.id === prod.user);
      setProduct(prod);

      let suggestions = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/category/${prod.category}`); 
      suggestions = (await suggestions.json());
      if (suggestions['data']){
        suggestions = suggestions['data'].filter(currProd => prod._id !== currProd._id).sort(() => 0.5 - Math.random()).slice(0, 4);
        setSugProd(suggestions);
      }

      setSugLoad(false);
      setLoading(false);
    };

    getProduct();
  }, [id]);

  const Loading = () => {
    return (
      <>
        <div className="col-md-6">
          <Skeleton height={400} />
        </div>
        <div className="col-md-6" style={{ lineHeight: 2 }}>
          <Skeleton height={50} width={300} />
          <Skeleton height={75} />
          <Skeleton height={25} width={150} />
          <Skeleton height={50} />
          <Skeleton height={150} />
          <Skeleton height={50} width={100} />
          <Skeleton height={50} width={100} style={{ marginLeft: 6 }} />
          <Skeleton height={50} width={100} style={{ marginLeft: 6 }} />
        </div>
      </>
    );
  };

  const Soading = () => {
    return (
      <>
        <div className="col md-4" style={{
              display: 'flex',
              height: 'auto',
              width: 'auto',
              padding: '10px',
              flexWrap: 'wrap',
            }}>

          <Skeleton height={400} width={300} style={{ marginLeft: 5 }} />
          <Skeleton height={400} width={300} style={{ marginLeft: 5 }} />
          <Skeleton height={400} width={300} style={{ marginLeft: 5 }} />
          <Skeleton height={400} width={300} style={{ marginLeft: 5 }} />
        
        </div>
      </>
    );
  };

  const ShowProduct = () => {
    return (
      <>
        <div className="col-md-6 d-flex justify-content-center">
          <img
            src={product.image}
            alt={product.title}
            style={{
              maxWidth: '100%',
              maxHeight: '500px',
              padding: '10px',
              textAlign: 'center',
            }}
          />
        </div>
        <div className="col-md-6">
          <h4 className="text-uppercase text-black-50">
            {product.category} | Merchant: &nbsp;
                <NavLink className="text-decoration-none text-reset" to={`/merchant/${product.user}`}>
                  {product.user && product.user.slice(-5)}
                </NavLink>
          </h4>
          <h1 className="display-5">{product.title}</h1>
          <p className="lead">
            {product.count > 0? `${product.count} left in Stock`: "Sold Out"}
          </p>
          <h3 className="display-6 fw-bold my-4">$ {product.price}</h3>
          <p className="lead">{product.description}</p>

          {merchantSelf? 
          (
          <>
            <NavLink to='/new-product' state={offeringState.findIndex(off => off._id === id).toString()} className="btn btn-outline-dark ms-2 px-3 py-2">Modify Product</NavLink>
            <NavLink to={`/merchant/${userState.user.id}`} className="btn btn-dark ms-2 px-3 py-2">View My Listings</NavLink>
          </>
          ): (
          <>
            <button className="btn btn-outline-dark px-4 py-2" onClick={() => addProduct(product)}>Add to Cart</button>
            <NavLink to="/cart" className="btn btn-dark ms-2 px-3 py-2">Go to Cart</NavLink>
          </>
          )}

        </div>
      </>
    );
  };

  const SuggestionProd = () => {

    return (
      <div className="row">
        {sugProd && sugProd.map((prod) => (
          <div
            className="col"
            key={prod._id}
            style={{
              display: 'flex',
              height: 'auto',
              width: 'auto',
              padding: '10px',
              flexWrap: 'wrap',
              maxWidth: '250px'
            }}
          >
            <div className="card " style={{ width: '18 rem' }}>
              <img
                src={prod.image}
                className="card-img-top"
                alt="..."
                style={{
                  width: '200px',
                  height: '150px',
                  padding: '10px',
                  display: 'flex',
                  flexWrap: 'wrap',
                }}
              />
              <div className="card-body">
                <h5 className="card-title">{prod.title}</h5>
                <p className="card-text ">${prod.price}</p>
              </div>
              <div className="card-footer bg-white">
                <NavLink to={`/products/${prod._id}`} className="btn btn-dark ms-2 px-3 py-2">
                  View Product
                </NavLink>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="container py-5">
        <div className="row py-4">
          {loading ? <Loading /> : <ShowProduct />}
        </div>
        <div className="row py-4">
          {sugLoad ? (
              <Soading />
          ) : (
            <>
              {sugProd.length > 0 && <p className='fst-italic'>Similar Suggestions</p>}
              <SuggestionProd />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
