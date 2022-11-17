import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { register, login, logout } from "../../services/user-auth";

const user = JSON.parse(localStorage.getItem('user'));

const initialState = user
  ? { ...user }
  : { user: null, token: null };

export const userRegister = createAsyncThunk(
    "user/register", 
    async ({name, email, password, address, phone}, thunkAPI) => {

        const result = await register(name, email, password, address, phone);
        
        // Return value is the action payload
        if (result.user) return result; 
        else return thunkAPI.rejectWithValue();

    }
)

export const userLogin = createAsyncThunk(
    "user/login", 
    async ({email, password}, thunkAPI) => {
        const result = await login(email, password);

        console.log("Login Result: ", result);

        if (result.user) return result;
        else return thunkAPI.rejectWithValue();
    }
)

export const userLogout = createAsyncThunk(
    "user/logout", 
    async () => {
        return await logout()
    }
);

const userSlice = createSlice({

    name: "user",
    initialState: initialState,

    extraReducers: {

        [userRegister.fulfilled]: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },

        [userRegister.rejected]: (state, action) => {
            state.user = null;
            state.token = null;
        },        

        [userLogin.fulfilled]: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },

        [userLogin.rejected]: (state, action) => {
            state.user = null;
            state.token = null;
        },

        [userLogout.fulfilled]: (state, action) => {
            state.user = null;
            state.token = null;
        },
    }

});

export default userSlice.reducer;