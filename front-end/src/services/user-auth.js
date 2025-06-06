export const register = async (name, email, password, address, phone) => {

    let registerOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, email, phone, address })
    }

    let resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/register`, registerOptions);
    let statusOk = resp.ok;
    resp = await resp.json();

    if (statusOk) localStorage.setItem("user", JSON.stringify(resp));

    return resp;

}

export const login = async (email, password) => {

    let loginOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    }

    let resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/login`, loginOptions);
    let statusOk = resp.ok;
    resp = await resp.json();

    if (statusOk) localStorage.setItem("user", JSON.stringify(resp));

    return resp;

}

export const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("offering");
    return null;
}

export const getUser = async (userId) => {

    let fetchOptions = {
        method: "GET",
        headers: authHeader(),
    }

    let resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/${userId}`, fetchOptions);
    resp = await resp.json();
    return resp;

}

export const tokenUnexpired = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null && new Date(user.expiresAt) > new Date();
}

export const authHeader = () => {
    // We call this function whenever we are making a backend call that requires auth
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token && tokenUnexpired()) { return { Authorization: 'Bearer ' + user.token }; }
    else { return {}; }
}