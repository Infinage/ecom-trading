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
                `/api/v1/products/`,
                { 
                    method: "POST", 
                    headers: {"Content-Type": "application/json", ...authHeader()},
                    body: JSON.stringify({
                        title: offering.title, 
                        category: offering.category, 
                        count: offering.count,
                        price: offering.price, 
                        image: offering.image,
                        description: offering.description, 
                        user: user.id,
                    })
                }
            );

            if (resp.ok){
                return await resp.json();
            }
        }

        return thunkAPI.rejectWithValue();
    }
);

export const removeOffering = createAsyncThunk(
    "offering/removeOffering",
    async ({index}, thunkAPI) => {
        
        const user = thunkAPI.getState().user.user;
        const offering = thunkAPI.getState().offering.at(index);

        if (user && offering){

            let resp = await fetch(
                `/api/v1/products/${offering._id}`,
                {
                    method: "DELETE",
                    headers: {"Content-Type": "application/json", ...authHeader()}
                }
            )

            if (resp.ok){
                resp = await resp.json();
                if (resp.count === 0)
                    return resp;
                else 
                    return thunkAPI.rejectWithValue();
            }

        } else {
            thunkAPI.rejectWithValue();
        }

    }
);

export const modifyOffering = createAsyncThunk(
    "offering/modifyOffering",
    async ({productId, offering}, thunkAPI) => {

        const user = thunkAPI.getState().user.user;

        if (user) {
            const resp = await fetch(
                `/api/v1/products/${productId}`,
                { 
                    method: "PATCH", 
                    headers: {"Content-Type": "application/json", ...authHeader()},
                    body: JSON.stringify({
                        title: offering.title, 
                        category: offering.category, 
                        count: offering.count,
                        price: offering.price, 
                        image: offering.image,
                        description: offering.description,
                    })
                }
            );

            if (resp.ok){
                return await resp.json();
            }
        }

        return thunkAPI.rejectWithValue();
    }
);

const offeringSlice = createSlice({
    name: "offering",
    initialState: initialState,
    reducers: {
        setOfferingItems: (state, action) => {
            localStorage.setItem("offering", JSON.stringify(action.payload));
            state = action.payload;
            return state;
        }
    },
    extraReducers: builder => {
        builder.addCase(addOffering.fulfilled, (state, action) => {
            state = [...state, action.payload];
            localStorage.setItem("offering", JSON.stringify(state));
            return state;
        })
        .addCase(modifyOffering.fulfilled, (state, action) => {
            state = state.map(prod => prod._id === action.payload._id? action.payload: prod);
            localStorage.setItem("offering", JSON.stringify(state));
            return state;
        })
        .addCase(removeOffering.fulfilled, (state, action) => {
            state = state.filter(prod => prod._id !== action.payload._id);
            localStorage.setItem("offering", JSON.stringify(state));
            return state;
        });
    }
});

export const {setOfferingItems} = offeringSlice.actions;
export default offeringSlice.reducer;