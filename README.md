# Ecom-Trading

Ecom-trading is a lightweight e-commerce application where users can create accounts, list products and trade items. (Note: Your own offerings remain hidden while you browse items to purchase).

Originally built as a Single Page Application, this project has been rewritten using a hypermedia-driven architecture. The migration drastically simplified the tech stack, eliminated heavy node modules, and reduced the final Docker deployment image to just **~13.6 MB** from **~250 MB**.

**Live Demo:** [ecom-trading.infinage.space](https://ecom-trading.infinage.space)

*(Note: The legacy MERN-stack implementation has been archived and is available on the `MERN` branch).*

## Tech Stack
- **Backend:** Golang
- **Database:** SQLite3
- **Frontend/UI:** Datastar (SSE/Hypermedia), Tailwind CSS
- **Deployment:** Docker

## Project Structure
- `/assets` - HTML templates, Tailwind CSS, SVG images, and Datastar scripts.
- `/internal/models` - SQLite database initialization, queries, and repository pattern.
- `/internal/handlers` - HTTP routing, middleware, and Datastar template rendering.
- `main.go` - Application entry point.
- `Dockerfile` - Multi-stage build for the optimized deployment image.

## Getting Started

The application is completely self-contained. Because it utilizes SQLite, no external database services (like Mongo Atlas) are required to run it.

### Environment Variables
- `POPULATE_SEED_DATA` (Optional): Set to `true` to populate the database with initial dummy data on startup.

### Running with Docker
Build and run the container:
```bash
docker build -t ecom-trading .
docker run -p 8080:8080 -e POPULATE_SEED_DATA=true ecom-trading
