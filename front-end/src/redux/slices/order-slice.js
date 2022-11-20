import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authHeader } from "../../services/user-auth";
import { delTotCart } from "./cart-slice";

export const handleOrder = createAsyncThunk(
    "order/handleOrder", 
    async (args, thunkAPI) => {
        thunkAPI.dispatch(delTotCart());
        let resp = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/order/${thunkAPI.getState().user.user.id}`, 
            {method: "POST", headers: authHeader()}
        );

        if (resp.ok) return await resp.json();
        else thunkAPI.rejectWithValue();
    } 
)

const orderSlice = createSlice({
    name: "order",
    initialState: [],
    extraReducers: builder => {
        builder.addCase(handleOrder.fulfilled, (state, action) => {
            state = action.payload;
            return state;
        }).addCase(handleOrder.rejected, (state, action) => {
            return [];
        })
    }
})

export default orderSlice.reducer;