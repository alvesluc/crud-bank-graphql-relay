# Woovi Project

A full-stack application with a Node.js server and comprehensive test suite.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [pnpm](https://pnpm.io/) package manager
- [Docker](https://www.docker.com/) and Docker Compose

## 🚀 Getting Started

### 1. Install Dependencies

Install dependencies in both the root directory and the server directory:

```bash
# Install root dependencies
pnpm i

# Install server dependencies
cd server
pnpm i
pnpm config:local
cd ..
```

### 2. Start Infrastructure Services

Make the Docker infrastructure available by running:

```bash
pnpm run services:detached
```

This will start all required services (database and redis) in detached mode.

### 3. Start the Development Server

Navigate to the server directory and start the development server:

```bash
cd server
pnpm dev
```

The server should now be running and ready to accept requests.

## 🧪 Running Tests

**Important**: Tests can only be run when the server is running.

To run tests in watch mode:

```bash
pnpm run test:watch
```

This will start Jest in watch mode with verbose output and run tests in band.

## 📁 Project Structure

```
woovi/
├── server/                 # Backend server application
│   ├── src/               # Source code
│   ├── schema/            # GraphQL schema
│   └── package.json       # Server dependencies
├── Woovi/                 # Project documentation
│   └── Desafio Woovi.md   # Changelog and decisions document
├── compose.yaml           # Docker Compose configuration
├── jest.config.js         # Jest test configuration
└── package.json           # Root dependencies and scripts
```

## 📚 Documentation

For detailed information about project decisions, changes, and technical decisions, please refer to the document located at:

**`Woovi/Desafio Woovi.md`**

This document serves as both a changelog and a description of the decisions made during the project development.

## 📬 API Testing

You can use the provided **Woovi Challenge.postman_collection.json** file to test and explore the API endpoints using [Postman](https://www.postman.com/). This collection includes example requests for authentication, user, transaction, and status endpoints. Import it into Postman to quickly get started with API testing and exploration.

## 🛠️ Available Scripts

### Root Directory Scripts

- `pnpm run test:watch` - Run tests in watch mode (requires server to be running)
- `pnpm run services:detached` - Start Docker services in detached mode
- `pnpm run services:down` - Stop and remove Docker services

### Server Directory Scripts

- `pnpm dev` - Start the development server
- `config:local` - Makes an copy of `.env.development` into `.env`

## 🐳 Docker Services

The project uses Docker Compose to manage infrastructure services. The configuration is defined in `compose.yaml` at the root of the project.

## 🔧 Development

- The server runs on the port specified in the server's environment configuration
- Tests are configured to run against the running server instance
- Environment variables are managed through `.env` files in the server directory

## 📝 Notes

- Make sure Docker is running before starting the services
- The server must be running for tests to pass
- All dependencies should be installed using `pnpm` for consistency 