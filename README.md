### TODO

2. Fix shipping page / Order Page
    - Fetch address from backend
    - Underneath address tab, have option to choose mode of payment (cash on delivery)
    - Instead of payment, show confirm order details
    - If cart is empty, shipping shouldn't work
    - Validation for credit card number and cvv
3. After products are confirmed by buyer, seller should receive a mail and contents from his inventory be reduced
4. Create error middlewares with proper error code / messages - backend, Create error pages - frontend
5. Switch from buyer to seller perspective from the front end
6. Settings page to update self (user) details, reset user password
7. Update social media links to yours and vijay's
8. Payment gateway - between buyer and seller
9. Chatbot integegration - Website support, maybe interact with website with the help of whatsapp / Telegram / Discord bots
10. Maps integration - Embed the company's address on footer
11. PWA / React Native

Login Using Redux Toolkit: https://www.bezkoder.com/react-redux-login-example-toolkit-hooks/

***

### DB Structure:

user: name, email, password, rating, endorsements, cart[products], offerings[products]
product: title, price, description, category, image, count, user

#### Functionalities:

0. Register an user
1. Login as a user
3. List all offerings of a user
4. Add / update an offering
5. Add / remove product to user-cart

3. Buy products: Decrement user-offering-product_count accordingly, create invoice (PDF) & send mail to both parties
4. Add / Update / Remove Endorsements for a seller
5. update a user