import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({

    name: "user",
    initialState: null,

    reducers: {
        
        userLogin: (state, action) => { 
            console.log("User Login reducer being called");
            return action.payload
        },

        userLogout: (state) => { 
            console.log("User Logout reducer being called");
            state = null;
            return state;
        },

        registerUser: (state, action) => {
            console.log("User register reducer being called");
            state = action.payload;
            return state;
        }
    }

});

export const {userLogin, userLogout, registerUser} = userSlice.actions;
export default userSlice.reducer;