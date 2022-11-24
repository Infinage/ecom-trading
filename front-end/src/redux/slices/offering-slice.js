import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authHeader } from "../../services/user-auth";

const offering = JSON.parse(localStorage.getItem("offering"));

/*
[{
    _id: 3sdas1asd12,
    name: ABC,
    category: apparel,
    count: 1,
    price: 20,
    image: freestockpics.com/image.png
    description: An awesome product
}]
*/

const initialState = offering ? [...offering]: [];

export const addOffering = createAsyncThunk(
    "offering/addOffering",
    async (offering, thunkAPI) => {
        
        const user = thunkAPI.getState().user.user;

        if (user) {
            const resp = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/products/`,
                { 
                    method: "POST", 
                    headers: {"Content-Type": "application/json", ...authHeader()},
                    body: JSON.stringify({
                        title: offering.name, 
                        category: offering.category, 
                        count: offering.count,
                        price: offering.price, 
                        image: offering.image,
                        description: offering.description, 
                        user: user.id,
                    })
                }
            );

            if (resp.ok)
                return offering;
        }

        return thunkAPI.rejectWithValue();
    }
);

export const removeOffering = createAsyncThunk(
    "offering/removeOffering",
    async ({}, thunkAPI) => {
        
    }
);

export const modifyOffering = createAsyncThunk(
    "offering/modifyOffering",
    async ({}, thunkAPI) => {
        
    }
);

const offeringSlice = createSlice({
    name: "offering",
    initialState: initialState,
    extraReducers: builder => {
        builder.addCase(addOffering.fulfilled, (state, action) => {
            state = [...state, action.payload];
            localStorage.setItem("offering", JSON.stringify(state));
            return state;
        })
    }
});

export default offeringSlice.reducer;