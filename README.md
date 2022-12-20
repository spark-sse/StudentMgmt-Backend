# Student-Management-System API

![Build Status](https://jenkins-2.sse.uni-hildesheim.de/buildStatus/icon?job=Teaching_StudentMgmt-Backend "Build Status")

Backend of the Student Management System.

## Table of Contents

- [Student-Management-System API](#student-management-system-api)
	- [Table of Contents](#table-of-contents)
	- [Usage as Client](#usage-as-client)
	- [Building and Deployment](#building-and-deployment)
		- [Alternatives](#alternatives)
		- [Configuration](#configuration)
	- [Development](#development)
		- [Getting Started](#getting-started)
		- [Running the Application](#running-the-application)
		- [Testing](#testing)
			- [Snapshot Testing](#snapshot-testing)
		- [Debugging](#debugging)
			- [Debugging the Application](#debugging-the-application)
			- [Debugging Tests](#debugging-tests)
		- [Adding Features](#adding-features)
			- [Adding a Database Entity](#adding-a-database-entity)
			- [Adding API Routes](#adding-api-routes)
			- [Listening to Events](#listening-to-events)
			- [Sending Notifications to other Systems](#sending-notifications-to-other-systems)
		- [Database Migrations](#database-migrations)
			- [Creating a Migration](#creating-a-migration)
				- [Automatically](#automatically)
				- [Manually](#manually)
			- [Running Migrations](#running-migrations)
			- [Reverting migrations](#reverting-migrations)
			- [Exporting and Importing Database Dump with VS Code](#exporting-and-importing-database-dump-with-vs-code)
				- [Setup](#setup)
				- [Export](#export)
				- [Import](#import)

## Usage as Client

If you want to use the API as a client, we recommend using the published OpenAPI specification to generate an API client for your desired programming language.

TODO: URL to OpenAPI specification

Paste the specification into a generator such as https://editor.swagger.io or setup your own generator (see [Student-Management-System/api-client-generator](https://github.com/Student-Management-System/api-client-generator) for reference). The [Swagger UI](https://editor.swagger.io) also allows you to browse all existing API routes and data schemas.

**Available clients**:

-   `typescript-angular`: https://www.npmjs.com/package/@student-mgmt/api-client
-   `java`: TODO

## Building and Deployment

Please ensure that [Node.js](https://nodejs.org/en) is installed on your system.
Running the application requires a [PostgreSQL](https://www.postgresql.org) database.

```sh
# Install dependencies
npm install

# Build the application
npm run build
```

The build output can be found in the `dist` folder. The entry point is `dist/src/main.js`.
You may use one of the following commands to start the application:

```sh
# Use config/production.yml
npm run start:prod

# Use config/demo.yml (Generates demo data)
npm run start:main
```

### Alternatives

Alternatively, you can also setup a simple **demo** ([config/demo.yml](config/demo.yml)) instance by using the included [docker-compose](docker-compose.yml) file, which will build and run the application with a PostgreSQL container.

```sh
docker compose up
```

Also see [Student-Management-System/StuMgmtDocker](https://github.com/Student-Management-System/StuMgmtDocker) for a more complete setup with other related services (i.e. [Student-Management-System/Sparkyservice-Project](https://github.com/Student-Management-System/Sparkyservice-Project) for authentication)

### Configuration

The following environment variables can be set. Environment variables will take precedence over those specified in [/config](https://github.com/SSEHUB/StudentMgmt-Backend/tree/master/config).

| Environment variable | Description                                                                                                                                                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SERVER_BASE_PATH     | URL that can be used to reach the api, i.e., "http://localhost:3000".                                                                                                                                                                                       |
| SERVER_PORT          | The port, which the application is listening to.                                                                                                                                                                                                            |
| AUTH_ISSUER_URL      | URL to the authentication provider, i.e., https://DOMAIN:PORT/realms/REALM                                                                                                                                                                                  |
| AUTH_JWKS_URL        | URL to the authentication provider's key set, i.e., https://DOMAIN:PORT/realms/REALM/protocol/openid-connect/certs                                                                                                                                          |
| CLIENT_BASE_PATH     | URL to the frontend client, i.e., "http://localhost:4200".                                                                                                                                                                                                  |
| DB_TYPE              | Specifies the database engine (i. e "postgres", "mysql", [etc.](https://typeorm.io/#/connection-options/common-connection-options)).                                                                                                                        |
| DB_HOST              | Database host.                                                                                                                                                                                                                                              |
| DB_PORT              | Port of the database.                                                                                                                                                                                                                                       |
| DB_USERNAME          | Database username.                                                                                                                                                                                                                                          |
| DB_PASSWORD          | Database password.                                                                                                                                                                                                                                          |
| DB_DATABASE          | Name of the database.                                                                                                                                                                                                                                       |
| TYPEORM_SYNC         | Indicates if database schema should be auto created on every application launch (true or false). Should not be used in production.                                                                                                                          |
| SMTP_HOST            | The SMTP-Server used for sending email notifications.                                                                                                                                                                                                       |
| SMTP_PORT            | Port of the SMTP -Server.                                                                                                                                                                                                                                   |
| SMTP_SECURE          | If true the connection will use TLS when connecting to server. If false (the default) then TLS is used if server supports the STARTTLS extension. In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false. |
| SMTP_USERNAME        | Username for the SMTP-Server.                                                                                                                                                                                                                               |
| SMTP_PASSWORD        | Password for the SMTP-Server.                                                                                                                                                                                                                               |
| MAIL_FROM            | Sets the "From" header of an email. For example "no-reply@student-mgmt-system"                                                                                                                                                                              |
| LOG_CONFIG           | If set to "true", prints the entire configuration object to the console. Useful for debugging purposes.                                                                                                                                                     |

## Development

The project uses the following technologies:

-   [NestJS](https://nestjs.com) - Backend framework
-   [TypeORM](https://typeorm.io) - Object-Relational Mapping (ORM)
-   [Jest](https://jestjs.io) - Testing library
-   [SuperTest](https://github.com/visionmedia/supertest) - E2E-Testing library

If you are using [VS Code](https://github.com/microsoft/vscode) as your IDE, we recommend the following extensions:

-   [Database Client](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-database-client2) - Database client (allows you to view, edit and import/export your database)
-   [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Opinionated code formatter
-   [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Static Program Analysis
-   [snapshot-tools](https://marketplace.visualstudio.com/items?itemName=asvetliakov.snapshot-tools) - Language service for test snapshots
-   [Add Only](https://marketplace.visualstudio.com/items?itemName=ub1que.add-only) - Easily execute only a single test suite or case

### Getting Started

Ensure that [Node.js](https://nodejs.org/en) and [Git](https://git-scm.com/downloads) are installed on your system.

```sh
# Clone repository
git clone https://github.com/Student-Management-System/StudentMgmt-Backend.git

# Change into project directory
cd StudentMgmt-Backend

# Install dependencies
npm install
```

### Running the Application

The application must be able to connect to an existing [PostgreSQL](https://www.postgresql.org) database. A convenient way to setup a local PostgreSQL database is to use [Docker](https://www.docker.com). Please refer to the [official documentation](https://docs.docker.com/desktop) for installation instructions.

Once Docker is installed and running on your system, execute the following steps:

```sh
# Download PostgreSQL image
docker pull postgres

# Start PostgreSQL instance
docker run -d -p 5432:5432 -e POSTGRES_DB=StudentMgmtDb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=admin --name studentmgmt-db postgres
```

The `docker run` command from above is configured to work with the default configuration values defined in `config/default.yml`.

To start the application run on of the following commands:

```sh
# Start application in watch-mode (uses config/development.yml)
npm run start:dev

# Start application (no watch-mode) and generate demo data (uses config/demo.yml)
npm run start:demo
```

### Testing

All tests use [Jest](https://jestjs.io).

```sh
# Run all unit tests
npm run test

# Run all e2e-tests
npm run test:e2e

# Run all tests and collect coverage (used in CI)
npm run test:jenkins

## Run specific test suite
npm run test -- course.service.spec.ts
npm run test:e2e -- courses.e2e-spec.ts

## Run specific test suite in watch-mode
npm run test -- course.service.spec.ts --watch
```

#### Snapshot Testing

In E2E-Tests you may encounter some tests that contain the following assertion:

```ts
expect(actual).toMatchSnapshot();
```

Snapshots will contains the entire `actual` object. The advantage of using snapshots is that we can detect unwanted changes to our responses without adding additional assertions to all of our tests. Since they can be updated automatically, tests become easier to maintain. However, snapshots do not carry the intent of the test case, hence you should add descriptive test names and assertions where appropriate.

-   When such a test is run for the first time, a snapshot file will be created in `e2e/__snapshots__`.
-   When this assertion fails, Jest will prompt you to run the testing command with the `-u` flag to update the corresponding snapshot
    -   If the changes were intended, rerun your test command with an appended `-u` flag

Always commit modified Snapshot files to the repository.

After adding a new snapshot assertion, make sure to run the test before committing it in order to create the snapshot. Otherwise, there will be no snapshot available in CI and the test will fail (due to the `--ci` option).

### Debugging

The following guide might help you to setup debugging in [VS Code](https://github.com/microsoft/vscode).

#### Debugging the Application

-   In VS Code, bring up the command palette (`F1`), search for `Debug: Toggle Auto Attach` and set it to `Always`
-   In VS Code, open the `Run and Debug (CTRL+Shift+D)` panel and add the following configuration to your `launch.json`

```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"type": "node",
			"request": "attach",
			"name": "Attach NestJS",
			"sourceMaps": true,
			"port": 9229,
			"restart": true,
			"stopOnEntry": false,
			"protocol": "inspector"
		}
	]
}
```

-   Start the application via `npm run start:debug`
-   In the `Run and Debug (CTRL+Shift+D)` view, select `Attach NestJS` and click `Start Debugging (F5)`
-   The application should now stop at your breakpoints

#### Debugging Tests

-   In VS Code, bring up the command palette (`F1`) and select `Debug: JavaScript Debug Terminal`
-   Insert a test command in the newly opened terminal instance, i.e. `npm run test -- course.service.spec.ts --watch`
-   The application should now stop at your breakpoints

### Adding Features

The following guide will outline how new features can be added to the API.

#### Adding a Database Entity

> This project uses [TypeORM](https://typeorm.io) to map objects (_entities_) to database tables. Please refer to the official documentation for more information.

-   Each _entity_ is stored in a file that should follow the following naming convention: `<name>.entity.ts`
-   All entities must be explicitly registered in [ormconfig.ts](ormconfig.ts)
-   A `repository` enables access to database tables for its corresponding _entity_
    -   Custom repositories must be registered in the `TypeOrmModule.forFeature` options
    -   Entities without custom repository are directly registered in the `TypeOrmModule.forFeature` options
    -   See [src/course/repositories/index.ts](src/course/repositories/index.ts) and [src/course/course.module.ts](src/course/course.module.ts)

#### Adding API Routes

-   API routes are defined in _controller_ classes
-   See [NestJS documentation](https://docs.nestjs.com/controllers) or study existing controllers
-   If you created a new controller, you should add the `@ApiTags("my-controller")` decorator to your controller class and register it in [main.ts](src/main.ts) inside the `setupSwaggerDocument()` function via `.addTag("my-controller")`. This way the OpenAPI specification will contain all routes of your newly added controller.

#### Listening to Events

> See https://docs.nestjs.com/recipes/cqrs for more.

Events are implemented as simple classes that are dispatched via the `EventBus.publish` method.

If you want to perform some background operations, when an event (see [events.ts](src/course/events/events.ts)) has occured inside the application (i.e., user joined a course), you can add an `EventHandler` as described below. An event may have multiple event handlers.

```ts
@EventsHandler(CourseJoined)
export class CourseJoinedHandler implements IEventHandler<CourseJoined> {
	constructor(/* Dependencies ... */) {}

	async handle(event: CourseJoined): Promise<void> {
		// Implementation ...
	}
}
```

If you want to listen to multiple events, you can create a [Saga](https://docs.nestjs.com/recipes/cqrs#sagas) inside of a class that is marked as `@Injectable()`:

```ts
@Saga()
saga$ = (events$: Observable<unknown>): Observable<void> => {
	return events$.pipe(
		ofType(AssignmentCreated, AssignmentUpdated, AssignmentRemoved),
		tap(() => {
			this.scheduleNextStartAndStop();
		}),
		map(() => undefined) // If you don't want to dispatch a new command
	);
};
```

#### Sending Notifications to other Systems

You may want to publish an event to subscribed systems, when an event of interest occurred (see [event documentation](api-docs/docs/events.md)).

Exposed events should be added to the OpenAPI specification through an enum defined in [events.ts](src/course/events/events.ts).

All events (class) that implement the `INotify` interface will trigger notifications containing the `NotificationDto` that is returned
from the `toNotificationDto()`.

```ts
export class AssignmentUpdated implements INotify {
	constructor(readonly courseId: string, readonly assignmentId: string) {}

	toNotificationDto(): NotificationDto {
		return {
			event: Event.ASSIGNMENT_UPDATED,
			courseId: this.courseId,
			assignmentId: this.assignmentId
		};
	}
}
```

### Database Migrations

> See https://typeorm.io/#/migrations for more information.

When you are developing with the `development` or `demo` configuration, the database will automatically synchronize any changes of the database schema.
This is fine for development, but **should not be used for `production`**, because it likely results in data loss. For example, when renaming a column, the ORM might assume that we dropped the old column and created a new unrelated column. In this case, all data inside this column would be lost.

**Remember to backup your (production) database before executing migrations.**

#### Creating a Migration

##### Automatically

Fortunately, TypeORM can generate migrations automatically with the following command:

**Attention**: Your database must be using the old schema when executing this command. Otherwise, there will be no changes to detect. See [here](#exporting-and-importing-database-schema-with-vs-code) for a guide on how to export and import a database dump with VS Code.

```sh
npm run typeorm migration:generate -- -n MigrationName
```

The migration will be generated into `migrations/<Timestamp>-MigrationName`.

You should inspect the generated migration, since the scenario described above might still occur here. In this case, you may need to change the generated migration code.

When you are refactoring or adding new features, try to create a migration for every change to the database schema instead of creating one huge migration to keep this inspection more manageable.

##### Manually

Sometimes you may need to create a migration from scratch, i.e., to change some values in the database.

You can do so by invoking the following command:

```sh
npm run typeorm migration:create -- -n MigrationName
```

Inside of migrations, you can also use repositories like so:

```ts
public async up(queryRunner: QueryRunner): Promise<void> {
	const userRepository = queryRunner.manager.getRepository<User>("User");
	const users = await userRepository.find();
	// Do something ...
}
```

Notice, that we had to use `"User"` instead of just using the class token `User`.

#### Running Migrations

> **Remember to backup your (production) database before executing migrations.**

Internally, the database maintains a table of executed migrations, hence only new migrations will be executed.
The execution order is determined by the timestamp in the migration's filename.

Invoke the following command:

```sh
npm run typeorm migration:run
```

#### Reverting migrations

The following command will revert the latest migration:

```sh
npm run typeorm migration:revert
```

#### Exporting and Importing Database Dump with VS Code

To test migrations locally, you may want to create database dump before performing any changes to the database schema (entities) and revert back to it to repeat the migration.

The following guide explains how this can be accomplished with VS Code.

##### Setup

-   Install the [Database Client](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-database-client2) extension
-   Connect to your database using (see [default configuration values](config/default.yml))

##### Export

-   Rightclick the `public` inside the `StudentMgmtDb`
-   Click `Export Data`, insert a filename and choose download location

##### Import

-   Rightclick the `public` inside the `StudentMgmtDb`
-   Click `Import SQL` and select a `.sql` file
