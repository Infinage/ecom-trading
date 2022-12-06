import { useNavigate, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import offering from '../assets/offering.svg';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getUser } from '../services/user-auth';
import { useState } from 'react';
import { removeOffering } from '../redux/slices/offering-slice';

const Offering = () => {
    
    const { id } = useParams();
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userState = useSelector((state) => state.user);
    const offeringReduxState = useSelector((state) => state.offering);

    const [offeringState, setOfferingState] = useState([]);
    const [merchantSelf, setMerchantSelf] = useState(true);

    const handleDelistProduct = (index) => {
      if (confirm("Your customers would no longer be able to see this Product. Are you sure you wish to delist this Item?")){
        dispatch(removeOffering({index}));
      }
    }

    useEffect(() => {

      const getUserOfferings = async () => {
        if (userState.user && userState.user.id === id){
          setOfferingState(offeringReduxState);
          setMerchantSelf(true);
        } else {
          setOfferingState((await getUser(id))['offerings']);
          setMerchantSelf(false);
        }
      }

      getUserOfferings();
    }, [id, offeringReduxState])

    const emptyOffering = () => {
        return (
            <div>
                <div className="row  bg-light" style={{ padding: '20px' }}>
                <div className="col-md-8">
                    <div className="align-items-end d-flex flex-column justify-content-center">
                    <div className="container">
                        <h5 className="card-title display-4 fw-bolder mb-0">
                        NO PRODUCTS LISTED
                        </h5>
                        <p className="card-text lead fs-3">
                            {
                            merchantSelf ? 
                            <NavLink to="/new-product" className="text-decoration-none link-dark">LIST YOUR PRODUCTS</NavLink>: 
                            "REQUEST MERCHANT TO LIST PRODUCTS"
                            }
                        </p>
                    </div>
                    </div>
                </div>
                <br />
                <div className="col-md-4">
                    <img
                    src={offering}
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
        )
    }

    const offeringItems = () => {
        return (
        <div className="container">
          <div className="row" style={{ padding: '10px' }}>
            <h3>Product Listings</h3>
            <div className="col-12">
              <table className="table table-image">
                <thead>
                  <tr>
                    <th scope="col">Image</th>
                    <th scope="col">Product Name</th>
                    <th scope="col">Description</th>
                    <th scope="col">Category</th>
                    <th scope="col">Stock Available</th>
                    <th scope="col">Price</th>
                    {merchantSelf && <th scope="col">Update</th>}
                  </tr>
                </thead>
                <tbody>
                {offeringState.map((offering, index) => (
                    <tr key={offering._id}>
                      <td style={{ width: '100px' }}>
                        <img
                          src={offering.image}
                          className="img-fluid img-thumbnail"
                          alt={offering.title}
                        />
                      </td>
                      <td>
                        <NavLink to={`/products/${offering._id}`} className="text-decoration-none link-dark">
                          {offering.title}<br/>
                        </NavLink>
                      </td>
                      <td>{offering.description}</td>
                      <td>{offering.category}</td>
                      <td>{offering.count}</td>
                      <td>{offering.price}</td>
                      { merchantSelf && <td>
                        <button
                          className={`btn btn-outline-dark mx-2 px-2`}
                          onClick={() => navigate(`/new-product`, {state: index.toString()})} 
                        >
                          <i className="fa fa-pencil"></i>
                        </button>
                        <button
                          className={`btn btn-outline-danger mx-2 px-2`}
                          onClick={() => handleDelistProduct(index)} 
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td> }
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="row">
            {merchantSelf && (
                <NavLink
                  to="/new-product"
                  className={`btn btn-outline-dark mb-5 w-25 mx-auto`}
                >
                  Sell More Products
                </NavLink>
            )}
          </div>
        </div>
        );
    }

    return (
        <div>{ offeringState.length > 0? offeringItems(): emptyOffering() }</div>
    );

}

export default Offering;