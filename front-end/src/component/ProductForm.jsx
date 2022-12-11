import productImage from '../assets/new-product.svg';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useRef } from 'react';
import { Toast } from 'bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { addOffering, modifyOffering } from '../redux/slices/offering-slice';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useState } from 'react';
import { tokenUnexpired } from '../services/user-auth';
import { NavLink } from 'react-router-dom';

const ProductForm = () => {

    const offerings = useSelector(state => state.offering);
    const dispatch = useDispatch();

    // OfferingIndex is passed as a state to "navigate", if index exists we use it to set values of the product form
    let offeringIndex = useLocation()['state'];

    offeringIndex = offeringIndex? Number(offeringIndex): null;
    const [initialValues, setInitialValues] = useState( { title: '', category: '', count: '', price: '', image: '', description: '' });
    const toastRef = useRef();

    // To avoid calling useEffect on the first render
    const isMounted = useRef(false);

    const refreshImage = async (url) => {

        let error = "";

        if (url){
            try {
                const res = await fetch(url);
                const buff = await res.blob();
                if (buff.type.startsWith('image/')){
                    document.getElementById("new-product-image").src = url;
                } else {
                    document.getElementById("new-product-image").src = import.meta.env.VITE_DEFAULT_IMAGE_URL;
                    error = "Invalid image URL entered.";
                }
            } catch (err) {
                document.getElementById("new-product-image").src = import.meta.env.VITE_DEFAULT_IMAGE_URL;
                error = "There was an error fetching the image.";
            }
        } else {
            document.getElementById("new-product-image").src = import.meta.env.VITE_DEFAULT_IMAGE_URL;
            error = 'Image URL must be provided.'; 
        }

        return error;

    }

    const handleSubmit = async (values) => {
        if (offeringIndex !== null){
            // Update offering
            dispatch(modifyOffering({productId: offerings[offeringIndex]._id, offering: values}));

        } else{
            // Add new offering
            dispatch(addOffering(values));
        }
    }

    useEffect(() => {
        
        // Set the initial values from index and refresh the values everytime there is some change
        if (offeringIndex != null) setInitialValues(offerings[offeringIndex]); 

        if (isMounted.current){
            const myToast = toastRef.current;
            const bsToast = new Toast(myToast, { autohide: true });
            bsToast.show();
        } else {
            isMounted.current = true;
        }
    }, [offerings]);

    return (
        <div>
            <div className="row  bg-dark" style={{ padding: '20px' }}>
            <div className="col-md-8">
                <div className="align-items-end d-flex flex-column justify-content-center">
                <div className="container">
                    <h5 className="card-title text-light display-4 fw-bolder mb-0">
                    SELL YOUR PRODUCT
                    </h5>
                    <p className="card-text lead fs-3 text-light">ADD NEW PRODUCT</p>
                </div>
                </div>
            </div>
            <br />
            <div className="col-md-4">
                <img
                src={productImage}
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
                <div className='row'>
                    <div className='col-md-6'>
                
                        <Formik
                            initialValues={initialValues}
                            validateOnMount="true"
                            enableReinitialize="true"
                            validate={values => {
                                const errors = {};

                                if (!values.title) { errors.title = 'Title must be provided.'; }
                                if (!values.category) {errors.category = 'Category must be provided.'; }
                                if (!values.count || values.count <= 0) {errors.count = 'Invalid value entered for Stock Count.'; }
                                if (!values.price || values.price <= 0) {errors.price = 'Invalid value entered for Price'; }
                                if (!values.description) {errors.description = 'A good description makes a great product listing.'; }

                                return errors;
                            }}

                            onSubmit={(values, { resetForm }) => {
                                handleSubmit(values); 
                                resetForm();
                                refreshImage();
                            }}
                        >

                            {({ values, handleChange, handleSubmit, setValues, isSubmitting, dirty, isValid }) => (
                                <Form>

                                    <label htmlFor="title">Product Name:</label>
                                    <Field type="text" name="title" autoComplete="off" className="form-control" placeholder="Enter Product Name"/>
                                    <ErrorMessage name="title" component="div" className='text-danger'/>

                                    <label htmlFor="category">Category:</label>
                                    <Field component="select" id="category" name="category" className="form-control">
                                        <option value="" disabled>-- Select Category --</option>
                                        <option value="Apparel">Apparel</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Furniture">Furniture</option>
                                        <option value="Utensils">Utensils</option>
                                        <option value="Other">Other</option>
                                    </Field>
                                    <ErrorMessage name="category" component="div" className='text-danger' />

                                    <label htmlFor="count">Stock Count:</label>
                                    <Field type="number" name="count" className="form-control" placeholder="Enter Stock Count"/>
                                    <ErrorMessage name="count" component="div" className='text-danger' />

                                    <label htmlFor="price">Product Price:</label>
                                    <Field type="number" name="price" className="form-control" placeholder="Enter Product Price"/>
                                    <ErrorMessage name="price" component="div" className='text-danger' />

                                    <label htmlFor="image">Image URL: </label>
                                    <Field type="text" validate={refreshImage} autoComplete="off" name="image" className="form-control" placeholder="Enter Image URL"/>
                                    <ErrorMessage name="image" component="div" className='text-danger' />

                                    <label htmlFor="description">Product Description: </label>
                                    <Field component="textarea" name="description" className="form-control" placeholder="Enter Product Description"/>
                                    <ErrorMessage name="description" component="div" className='text-danger' /><br/> 

                                    {
                                    tokenUnexpired() ? 
                                        <button type="submit" disabled={!isValid} className='btn btn-dark'>Submit</button> :
                                        <NavLink type="button" disabled={!isValid} to="/login" className='btn btn-dark'>Submit</NavLink>
                                    }

                                </Form>
                            )}
                        </Formik>
                    </div>

                    <div className='col-md-6 d-flex'>
                        <img id="new-product-image" className='rounded mx-auto' src={import.meta.env.VITE_DEFAULT_IMAGE_URL}/>
                    </div>
        
                    <div className="position-fixed bottom-0 end-0 d-flex justify-content-end p-3" style={{ zIndex: '11' }}>
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
                            <strong className="me-auto">Note</strong>
            
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="toast"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="toast-body">Your request has been processed successfully.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductForm;