import { Logger, LogLevel, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as dotenv from "dotenv";
import { getConnection } from "typeorm";
import { DEMO_CONFIG } from "../test/db-setup/demo";
import { StudentMgmtDbEntities } from "../test/utils/demo-db";
import { Config } from "./.config/config";
import { env, environment } from "./.config/environment";
import {
	IndividualPercentWithAllowedFailuresRuleDto,
	OverallPercentRuleDto
} from "./admission-status/dto/admission-rule.dto";
import { AppModule } from "./app.module";
import { StudentMgmtEvent } from "./course/events/events";
import { StudentMgmtException } from "./course/exceptions/custom-exceptions";
import { SubscribedEvents } from "./notification/subscriber/subscriber.dto";
import { SubscriberRepository } from "./notification/subscriber/subscriber.repository";
import { EntityAlreadyExistsFilter } from "./shared/entity-already-exists.filter";
import { EntityNotFoundFilter } from "./shared/entity-not-found.filter";
import { RoundingBehavior } from "./utils/math";
import { VERSION } from "./version";
dotenv.config();

async function bootstrap(): Promise<void> {
	const version = VERSION;
	const logger = new Logger("Bootstrap");
	const basePath = Config.get().server.basePath;
	const port = Config.get().server.port;

	console.log(`Student-Management-System-API v${version}`);
	console.log(`Environment: ${env("NODE_ENV")}`);

	const logLevels = Config.get().logger.levels as LogLevel[];
	console.log("Log levels:", logLevels);

	if (env("LOG_CONFIG") === "true") {
		console.log("Configuration:");
		console.log(Config.get());
	}

	Config.validate();
	console.log("Configuration appears to be valid.");

	if (environment.is("production") && Config.get().db.synchronize) {
		console.log(
			"Warning: db.synchronize is enabled. This option should not be used in production environments."
		);
	}

	if (environment.is("production") && Config.get().db.dropSchema) {
		console.log(
			"Warning: db.dropSchema is enabled. This option should not be used in production environments."
		);
	}

	logger.verbose("Creating application...");
	const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: logLevels });
	logger.verbose("Application created!");

	app.useGlobalFilters(new EntityNotFoundFilter(), new EntityAlreadyExistsFilter());
	app.useGlobalPipes(new ValidationPipe({ transform: true })); // Automatically transform primitive params to their type
	app.enableCors({ exposedHeaders: "x-total-count" });
	app.disable("x-powered-by");

	setupSwaggerDocument(app, { basePath, version });

	// If demo environment, populate database with test data
	if (environment.is("demo")) {
		await new StudentMgmtDbEntities(DEMO_CONFIG).populateDatabase(getConnection());
	}

	// If notification subscribers were specified
	const notificationConfig = Config.get().notifications;
	if (notificationConfig.subscribers?.length > 0) {
		await registerSubscribers(notificationConfig.subscribers as any);
	}

	logger.verbose("Starting application...");
	await app.listen(port);
	logger.verbose("Application started!");
	logger.verbose(`Listening on port: ${port}`);
	logger.verbose(`BasePath: ${basePath}`);
	logger.verbose(`Swagger-UI: ${basePath}/api`);
}
bootstrap();

function setupSwaggerDocument(
	app: NestExpressApplication,
	args: { basePath: string; version: string }
) {
	const options = new DocumentBuilder()
		.addServer(args.basePath, "Base path")
		.addServer("/", "Relative path")
		.addBearerAuth()
		.setTitle("Student-Management-System-API")
		.setDescription(
			`The Student-Management-System-API. <a href='${args.basePath}/api-json'>JSON</a>`
		)
		.setVersion(args.version)
		.addTag("authentication")
		.addTag("course")
		.addTag("course-participants")
		.addTag("course-config")
		.addTag("assignment")
		.addTag("assessment")
		.addTag("group")
		.addTag("user")
		.addTag("assignment-registration")
		.addTag("admission-status")
		.addTag("submission")
		.addTag("activity")
		.addTag("assessment-allocation")
		.addTag("notification")
		.addTag("mail")
		.addTag("demo")
		.build();

	const document = SwaggerModule.createDocument(app, options, {
		extraModels: [
			StudentMgmtException,
			StudentMgmtEvent,
			RoundingBehavior,
			IndividualPercentWithAllowedFailuresRuleDto,
			OverallPercentRuleDto
		]
	});

	SwaggerModule.setup("api", app, document);
}

/**
 * Inserts or updates the given subscribers.
 */
async function registerSubscribers(
	subscribers: {
		courseId: string;
		name: string;
		url: string;
		events: SubscribedEvents;
	}[]
) {
	const repo = getConnection().getCustomRepository(SubscriberRepository);

	for (const sub of subscribers) {
		await repo.addOrUpdate(sub.courseId, sub);
	}
}
