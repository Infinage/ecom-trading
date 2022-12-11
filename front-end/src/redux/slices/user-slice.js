import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { pushToUserCart } from "../../services/product-util";
import { register, login, logout, getUser } from "../../services/user-auth";
import { delTotCart, setCartItems } from "./cart-slice";
import { setOfferingItems } from "../../redux/slices/offering-slice";

const user = JSON.parse(localStorage.getItem('user'));

/*
{
  "user": {
    "id": "Asdd1ada",
    "name": "ABC",
    "cartSize": 2
  },
  "expiresAt": 2022-12-08T14:21:11.077Z,
  "token": "asdasd1asd12ads"
}
*/
const initialState = user
  ? { ...user }
  : { user: null, token: null, expiresAt: null };

export const userRegister = createAsyncThunk(
    "user/register", 
    async ({name, email, password, address, phone}, thunkAPI) => {

        const result = await register(name, email, password, address, phone);
        
        // Return value is the action payload
        if (result.user) return result; 
        else return thunkAPI.rejectWithValue(result.message);

    }
)

export const userLogin = createAsyncThunk(
    "user/login", 
    async ({email, password}, thunkAPI) => {
        const result = await login(email, password);
        if (result.user) {
            // Logic to push existing cart state to user on DB (frontend to backend)
            const tempCart = thunkAPI.getState().cart;
            if (tempCart.length > 0)
                await pushToUserCart(tempCart);

            // Backend to frontend: pull
            const user = await getUser(result.user.id);
            thunkAPI.dispatch(setCartItems(user.cart ? user.cart: []));
            thunkAPI.dispatch(setOfferingItems(user.offerings ? user.offerings: []));
            return result;
        }
        else return thunkAPI.rejectWithValue();
    }
)

export const userLogout = createAsyncThunk(
    "user/logout", 
    // 'args' are undefined. Passing args is optional
    async (args, thunkAPI) => {
        thunkAPI.dispatch(delTotCart());
        return await logout()
    }
);

const userSlice = createSlice({

    name: "user",
    initialState: initialState,

    reducers: {
        incrementCart: (state, action) => {
            state.user.cartSize += 1;
            return state;
        },

        decrementCart: (state, action) => {
            state.user.cartSize -= 1;
            return state;
        }
    },

    extraReducers: (builder) => { 
        builder.addCase(
            // If user registration is successful
            userRegister.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.expiresAt = action.payload.expiresAt;
        }).addCase(
            // If user login is successful
            userLogin.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.expiresAt = action.payload.expiresAt;
        }).addCase(
            // If user logout is successful
            userLogout.fulfilled, (state, action) => {
                state.user = null;
                state.token = null;
                state.expiresAt = null;
        }).addCase(
            // If user registration has failed
            userRegister.rejected, (state, action) => {
                state.user = null;
                state.token = null;
                state.expiresAt = null;
        }).addCase(
            // If user login has failed
            userLogin.rejected, (state, action) => {
                state.user = null;
                state.token = null;
                state.expiresAt = null;
        })
    }

});

export const {incrementCart, decrementCart} = userSlice.actions;
export default userSlice.reducer;