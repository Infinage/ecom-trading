import {createSlice} from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "order",
  initialState: [],
  reducers: {
      handleOrder: (state, action) => {
        console.log("Handle order reducer being called");
        state = action.payload;
        return state;
      }
    }
  }
);

export const {handleOrder} = orderSlice.actions;
export default orderSlice.reducer;