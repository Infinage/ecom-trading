import {createSlice} from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: [],
    reducers: {
        addCart: (state, action) => {
            console.log("Add Cart reducer being called");
            const exist = state.find((x) => x._id === action.payload._id);
            if (exist) {
                // Increase the Quantity
                return state.map((x) => x._id === action.payload._id ? { ...x, quantity: x.quantity + 1 } : x);
            } else {
                // Add new item
                return [...state, {...action.payload, quantity: 1}];
            }
        },

        delCart: (state, action) => {
            console.log("Del Cart reducer being called");
            const exist1 = state.find((x) => x._id === action.payload._id);
            if (exist1.quantity === 1) {
                return state.filter((x) => x.id !== exist1.id);
            } else {
                return state.map((x) => x._id === action.payload._id ? { ...x, quantity: x.quantity - 1 } : x);
            }
        },

        delTotCart: (state) => {
            console.log("Delete total cart reducer being called");
            state = [];
            return state;
        } 
    }
});

export const {addCart, delCart, delTotCart} = cartSlice.actions;
export default cartSlice.reducer;