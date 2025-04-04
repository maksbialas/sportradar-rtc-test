# Real-time Crawlers - Interview Task

[![codecov](https://codecov.io/gh/maksbialas/sportradar-rtc-test/graph/badge.svg?token=K74KN8AU71)](https://codecov.io/gh/maksbialas/sportradar-rtc-test)

## How to run

To start the application, run `docker compose up` (`docker-compose up` for Docker Compose v1).
The API will be available on port `4000` by default. The default path is `/client/state`.

You can also start the app locally:
1. Run `npm install` in the root of the project to install dependencies;
2. Run `npm run build` to build the app;
3. Run `npm run start` to start the app.

API host, port and path can be configured via enviromental variables `API_HOST`, `API_PORT`, `API_PATH`, respectively.

## About the solution

The app relies on a minimal number of external dependencies. [Fastify](https://fastify.dev) is used to serve the API,
[vitest](https://vitest.dev) for testing. A minimal [CI flow](.github/workflows/ci.yml) has been set up for code quality control.
Below is the detailed explanation of each app component.

### [API Handlers](src/apiHandlers.ts)

The app fetches data from two sources that share similar logic and structure for both retrieval and extraction.
To avoid duplication, the [Template Method Pattern](https://en.wikipedia.org/wiki/Template_method_pattern)
is used to define a shared abstraction that handles fetching, caching, validation, and data extraction.
It exposes a `getData` method, that connects all the processing steps.

Caching relies on the ETag header provided by the Simulation API. If the ETag value hasn’t changed, the data is not refetched;
if it has, we fetch updated data.

### [Data Extractor](src/dataExtractor.ts)

Data from both sources is merged into a unified format to create a meaningful response. This is handled via the
[Facade Pattern](https://en.wikipedia.org/wiki/Facade_pattern), exposing a single extract method. 
It fetches data using the API Handlers, extracts scores, applies mapping and returns a typeful result.

### [State Store](src/stateStore.ts)

The State Store handles in-memory storage of the extracted data. It provides methods for updating (`update`)
and retrieving (`list`, `historize`) the state. If persistent storage (e.g., a database) is added in the future, 
this module would be the integration point.

### [API server](src/server.ts)

The API server is built with Fastify, an Express-like, high-performance server framework.
It retrieves the processed data from the State Store and exposes it through a defined HTTP endpoint.

### [Config](src/config.ts)

All configuration values are managed by a single Config class, which reads from environment variables and exposes them to the app. 
To ensure consistency accross the whole app, the [Singleton Pattern](https://en.wikipedia.org/wiki/Singleton_pattern) was used.

## Testing

Run tests with `npm test`.

App is tested in vitest, the coverage is computed by V8. The badge on top shows the coverage from the latest successful test job
(let's keep it 100%!).
