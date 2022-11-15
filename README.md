### TODO

1. Create backend for user login func with JWT, BcyrptJS (user), cart
    - After products are confirmed by buyer, seller should receive a mail and contents from his inventory be reduced

2. If multiple items exist in cart and decrement is clicked then the entire items are removed - Fix it
3. Study react front end logic already written
4. Remove react code logic with proper backend logic
5. Create error middlewares with proper error code / messages - backend
6. Create error pages - frontend
7. Switch from buyer to seller perspective from the front end
8. Settings page to update self (user) details

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