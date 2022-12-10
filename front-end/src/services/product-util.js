import { authHeader } from "./user-auth";

export const pushToUserCart = async (products) => {

    let fetchOptions = {
        method: "PATCH",
        headers: {"Content-Type": "application/json", ...authHeader()},
        body: JSON.stringify(products)
    }
    
    let resp = await fetch(`/api/v1/user/modifyCart`, fetchOptions);
    resp = await resp.json();
    return resp;

}