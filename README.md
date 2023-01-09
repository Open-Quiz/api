<h1>Open Quiz API</h1>

## Table of Contents
- [Table of Contents](#table-of-contents)
- [About the Project](#about-the-project)
  - [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
    - [Prerequisites](#prerequisites-1)
  
## About the Project

### Technologies

<div style="margin: 10px 0">
    <a href="https://expressjs.com/">
        <img src="https://img.shields.io/badge/express-%23000000.svg?&style=for-the-badge&logo=express&logoColor=white" />
    </a>
    <a href="https://www.prisma.io/">
        <img src="https://img.shields.io/badge/prisma-%232D3748.svg?&style=for-the-badge&logo=prisma&logoColor=white" />
    </a>
    <a href="https://www.postgresql.org/">
        <img src="https://img.shields.io/badge/postgresql-%23336791.svg?&style=for-the-badge&logo=postgresql&logoColor=white" />
    </a>
    <a href="https://www.typescriptlang.org/">
        <img src="https://img.shields.io/badge/typescript-%233178C6.svg?&style=for-the-badge&logo=typescript&logoColor=white" />
    </a>
</div>

## Getting Started

### Prerequisites

1. `yarn`. This can be installed using `npm i -g yarn`.
2. [PostgreSQL](https://www.postgresql.org/download/).
3. [Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).
4. [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

### Installation

1. Download the dependencies using `yarn install`. This automatically generates types for the models and validators at `src/zod`.
2. Create `.env.development` for the development environment variables:
    ```py
    # Optional. By default this is 8000.
    PORT=8000

    # https://www.prisma.io/docs/concepts/database-connectors/postgresql#connection-url
    DATABASE_URL="postgresql://<user>:<password>@localhost:5432/open-quiz?schema=public"
    ```
3. Setup the PostgreSQL tables using `yarn prisma:push`.
4. Start the API with `yarn dev`.

## Testing

This projects consists of two types of tests:

1. [Unit Tests](#unit-tests).
2. [Integration Tests](#integration-tests).

The tests are written using [Vitest](https://vitest.dev/). You'll notice that they are run with the `--threads false` flag. This is to prevent test suites from being run concurrently as it causes two instances of the API to be created, each trying to bind to the same port.

### Unit Tests

The unit tests are located throughout the `src` folder and test the api by mocking the return values from `prisma`. This is ideal for testing non-database specific logic such as validation, etc.

You can run these tests using `yarn test:unit`. To change the port the API uses refer to the example [.env.test](#prerequisites) file.

### Integration Tests

#### Prerequisites

1. [Docker Compose](https://docs.docker.com/compose/install/).
2. A `.env.test` file:

    ```py
    # Optional. By default this is 8000.
    PORT=8001

    # This must match the environment variables in `docker-compose.yml`,
    # The host and ip must also match the `wait-for-db` package.json script.
    DATABASE_URL="postgresql://prisma:prisma@localhost:5433/tests"
    ```

Integration tests are located in `tests/integration` and work by running a test PostgreSQL database in a docker container which is stopped after the tests have run. This means we don't need to mock `prisma`, allowing us to simulate real requests.

You can run them using `yarn test:integration`.

> **Note**  
> The [`wait-for-it.sh`](https://github.com/vishnubob/wait-for-it) script is necessary to ensure that the tests don't start until PostgreSQL is ready to accept connections.
