# Open Quiz API <!-- omit in toc -->

[![codecov](https://img.shields.io/codecov/c/gh/Open-Quiz/api/main?label=codecov&logo=codecov&style=for-the-badge)](https://codecov.io/gh/Open-Quiz/api)

## Table of Contents <!-- omit in toc -->
- [About the Project](#about-the-project)
  - [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Testing](#testing)
  - [Prerequisites](#prerequisites-1)
  - [Integration Tests](#integration-tests)
  - [Unit Tests](#unit-tests)
  - [Test Coverage](#test-coverage)
  
## About the Project

The Open Quiz API is an open source API which can be used to manage the creating, storing and sharing of quizzes, freeing you to work on bringing your product to life!

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

The tests are written using [Vitest](https://vitest.dev/). You'll notice that they are run with the `--threads false` flag. This is to prevent test suites from being run concurrently and attempting to access the `prisma` instant at the same time.

The tests can be run using `yarn test`.

### Prerequisites

1. [Docker Compose](https://docs.docker.com/compose/install/).
2. A `.env.test` file:

    ```py
    # Optional. By default this is 8000.
    PORT=8001

    # This is not required for running the unit tests. It must match the
    # environment variables in `docker-compose.yml`.
    DATABASE_URL="postgresql://prisma:prisma@localhost:5433/tests"
    ```

### Integration Tests

Integration tests are defined by the `@Integration` prefix in their suite descriptions. Integration tests work by running a test PostgreSQL database in a docker container which is stopped after the tests have run. This means we don't need to mock `prisma`, allowing us to simulate real requests and their responses.

### Unit Tests

Unit Tests are distinguished by the `@Unit` prefix in their suite descriptions. They should be used when testing parts of the API separate from other implementations.


### Test Coverage

You can run all the tests with coverage using `yarn test:coverage`.