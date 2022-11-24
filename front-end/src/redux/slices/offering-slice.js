import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

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
    async ({}, thunkAPI) => {

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
    }
});

export default offeringSlice.reducer;