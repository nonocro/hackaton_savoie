# Hackathon Savoie - Data Visualization Application

This project is a data visualization application for the Savoie department (73) in France, providing information about communes, population distribution, and medical services availability.

## Project Structure

The project consists of two main parts:

- **Backend**: A Node.js Express API that serves data about the Savoie department
- **Frontend**: A React application that visualizes the data

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

## Installation

Clone the repository and install dependencies for both the backend and frontend:

```bash
# Clone the repository
git clone <repository-url>
cd hackathon_savoie

# Install backend dependencies
cd hackathon_back
npm install

# Install frontend dependencies
cd ../hackathon_front
npm install
```

## Backend Setup

### Environment Variables

Create a `.env` file in the `hackathon_back` directory with the following content:

```
PORT=5000
BDJSON=true
```

Setting `BDJSON=true` will use local JSON data instead of making external API calls.

### Running the Backend

```bash
cd hackathon_back

# Start the server
npm run start
```

The API will be available at `http://localhost:5000`.

### API Documentation

The API documentation is available at `http://localhost:5000/api-docs` when the server is running.

### Testing

To run backend tests:

```bash
cd hackathon_back
npm test
```

## Frontend Setup

### Running the Frontend

```bash
cd hackathon_front

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
cd hackathon_front
npm run build
```

### Testing

To run frontend tests:

```bash
cd hackathon_front
npm test:e2e
```

## Available Endpoints

The backend provides several endpoints to access data about the Savoie department:

- `GET /departements/73/communes`: List of communes in Savoie
- `GET /departements/73/communes/:code`: Information about a specific commune
- `GET /departements/73/medecins`: Medical practitioners in Savoie
- `GET /departements/73/medecins/:codePostal`: Medical practitioners in a specific postal code
- `GET /departements/73/nombre-habitant-par-medecin/:code`: Population per medical practitioner ratio

## Features

- Visualization of communes in Savoie
- Population density information
- Medical services availability
- Ratio of inhabitants per medical practitioner

## Tech Stack

### Backend

- Node.js
- Express
- Swagger UI for API documentation
- Jest for testing

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Playwright for testing

## License

[MIT](LICENSE)
