import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { delTotCart } from "./cart-slice";

export const handleOrder = createAsyncThunk(
    "order/handleOrder", 
    async (products, thunkAPI) => {
        thunkAPI.dispatch(delTotCart());
        return products;
    } 
)

const orderSlice = createSlice({
    name: "order",
    initialState: [],
    extraReducers: builder => {
        builder.addCase(handleOrder.fulfilled, (state, action) => {
            state = action.payload;
            return state;
        })
    }
})

export default orderSlice.reducer;