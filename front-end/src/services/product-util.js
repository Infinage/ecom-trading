import { authHeader } from "./user-auth";

export const pushToUserCart = async (products) => {

    let fetchOptions = {
        method: "PATCH",
        headers: {"Content-Type": "application/json", ...authHeader()},
        body: JSON.stringify(products)
    }
    
    let resp = await fetch(`/user/modifyCart`, fetchOptions);
    resp = await resp.json();
    console.log(resp);
    return resp;

}