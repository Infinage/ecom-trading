import { useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import offering from '../assets/offering.svg';
import { useSelector, useDispatch } from 'react-redux';

const Offering = () => {
    
    const { id } = useParams();
    const offeringState = useSelector((state) => state.offering);

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
                            <NavLink to="/new-product" className="text-decoration-none link-dark">LIST YOUR PRODUCTS</NavLink>
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
                    <th scope="col">Update</th>
                  </tr>
                </thead>
                <tbody>
                {offeringState.map((offering) => (
                    <tr key={offering._id}>
                      <td style={{ width: '100px' }}>
                        <img
                          src={offering.image}
                          className="img-fluid img-thumbnail"
                          alt={offering.name}
                        />
                      </td>
                      <td>
                        <NavLink to={`/products/${product._id}`} className="text-decoration-none link-dark">
                          {offering.name} <br/>
                        </NavLink>
                      </td>
                      <td>{offering.description}</td>
                      <td>{offering.category}</td>
                      <td>{offering.count}</td>
                      <td>
                        <button
                          className={`btn btn-outline-primary mx-2 px-2`}
                          onClick={() => {}} 
                        >
                          <i className="fa fa-plus"></i>
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        );
    }

    return (
        <div>
            {emptyOffering()}
        </div>
    );

}

export default Offering;