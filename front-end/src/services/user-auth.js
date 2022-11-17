export const register = async (name, password, email, phone, address) => {
    
    let registerOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name, password, email, phone,address})
    }

    let resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/register`, registerOptions);
    let statusOk = resp.ok;
    resp = await resp.json();

    if (statusOk)localStorage.setItem("user", JSON.stringify(resp));

    return resp;

}

export const login = async (email, password) => {

    let loginOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
    }

    let resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/login`, loginOptions);
    let statusOk = resp.ok;
    resp = await resp.json();

    if (statusOk) localStorage.setItem("user", JSON.stringify(resp));

    return resp;
    
}

export const logout = () => {
    localStorage.removeItem("user");
    return null;
}

export const authHeader = () => {
    // We call this function whenever we are making a backend call that requires auth
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) { return { Authorization: 'Bearer ' + user.token }; } 
    else { return {}; }
}