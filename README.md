# Open Quiz API

## Development

## Testing

This projects consists of two types of tests:

1. Unit Tests.
2. Integration Tests.

The tests are written using [Vitest](https://vitest.dev/). You'll note that it's run with the `--threads false` flag. This is to prevent test suites being run concurrently as this will result in two instances of the API trying to bind to the same port.

### Unit Tests

The unit tests are located throughout the `src` folder and test the api by mocking the return values from `prisma`. This is ideal for testing non-database specific logic such as validation, etc.

You can run them using `yarn test:unit`. To change the port the API uses refer to the example [.env.test](#prerequisites).

### Integration Tests

#### Prerequisites

1. [Docker Compose](https://docs.docker.com/compose/install/).
2. A `.env.test` file:

    ```py
    # Optional. By default this is 8000. Note that this will also be used for the unit tests.
    PORT=8001

    # This must match the environment variables in `docker-compose.yml`.
    DATABASE_URL="postgresql://prisma:prisma@localhost:5433/tests"
    ```

Integration tests are located at `tests/integration` and work by running a test PostgreSQL database in a docker container which is then stopped after the tests have run. This means we don't need to mock `prisma` allowing us to simulate real requests.

You can run them using `yarn test:integration`.
