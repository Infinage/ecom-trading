# Ecom-Trading

Ecom-trading is a NodeJS/ReactJS-based e-commerce application where users can trade items with one another. While the initial design was created by a colleague, additional functionalities have been introduced to make changes persistent. Users can create accounts, list their products, and interact with each other in a trading environment. Your offerings remain hidden when you are trying to purchase items.

Live demo (non-dockerized, Mongo Atlas): https://ecom-trading.cyclic.app/

## Table of Contents
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Future Plans](#future-plans)

## Project Structure

The project is organized into the following main components:

- `./frontend`: Contains the ReactJS-based frontend code.
- `./backend`: Contains the NodeJS-based backend code.
- Docker files: Dockerized versions of the application for easy deployment.

## Getting Started

1. Replace all `sample.env` files available with `.env` equivalents.
2. If Docker isn't available, ensure that you update the `MONGO_URI` in `./backend/.env` with the correct URI that you have set up - either local or using MongoDB Atlas.
3. Starting the Application
- With Docker installed:
    ```
    docker-compose up
    ```
- Without Docker:
    ```
    npm run build
    npm start
    ```

## Future Plans
- Deploy dockerized code on Google cloud to explore GCP.
- Implement product recommendations using machine learning.
- Develop a full-blown cart functionality for users to transact with money.
- Integrate a chatbot for website support and interaction through WhatsApp, Telegram, or Discord bots.
