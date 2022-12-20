import * as config from "config";
import { DeepPartial } from "typeorm";
import * as y from "yup";
import { env } from "./environment";

export class Config {
	private static _config: ConfigurationSettings = null;

	/** Merges the configuration values from `/config/[environment].yml` with environment variables. */
	static create(): void {
		const cfg = config.util.toObject() as ConfigurationSettings;

		// Partial configuration with environment variables and original config values as fallback
		const cfgWithEnv: DeepPartial<ConfigurationSettings> = {
			logger: {},
			notifications: {},
			authentication: {
				issuerUrl: env("AUTH_ISSUER_URL") ?? cfg.authentication.issuerUrl,
				jwksUrl: env("AUTH_JWKS_URL") ?? cfg.authentication.jwksUrl
			},
			server: {
				basePath: env("SERVER_BASE_PATH") ?? cfg.server?.basePath,
				port: env("SERVER_PORT") ? Number(env("SERVER_PORT")) : cfg.server?.port
			},
			db: {
				type: env("DB_TYPE") ?? cfg.db?.type,
				host: env("DB_HOST") ?? cfg.db?.host,
				port: env("DB_PORT") ? Number(env("DB_PORT")) : cfg.db?.port,
				database: env("DB_DATABASE") ?? cfg.db?.database,
				username: env("DB_USERNAME") ?? cfg.db?.username,
				password: env("DB_PASSWORD") ?? cfg.db?.password,
				synchronize: env("TYPEORM_SYNC")
					? Boolean(JSON.parse(env("TYPEORM_SYNC")))
					: cfg.db?.synchronize
			},
			mailing: {
				clientBasePath: env("CLIENT_BASE_PATH") ?? cfg.mailing?.clientBasePath,
				from: env("MAIL_FROM") ?? cfg.mailing.from,
				smtp: {
					host: env("SMTP_HOST") ?? cfg.mailing?.smtp?.host,
					port: env("SMTP_PORT") ? Number(env("SMTP_PORT")) : cfg.mailing?.smtp?.port,
					useSecureConnection: env("SMTP_SECURE")
						? Boolean(JSON.parse(env("SMTP_SECURE")))
						: cfg.mailing?.smtp?.useSecureConnection,
					username: env("SMTP_USERNAME") ?? cfg.mailing?.smtp?.username,
					password: env("SMTP_PASSWORD") ?? cfg.mailing?.smtp?.password
				}
			}
		};

		if (!cfgWithEnv.mailing.enabled) {
			const definedSmtpKeys = JSON.parse(JSON.stringify(cfgWithEnv.mailing.smtp));
			if (Object.keys(definedSmtpKeys).length == 0) {
				cfgWithEnv.mailing.smtp = undefined; // Reset SMTP config to avoid validation
			}
		}

		this._config = config.util.extendDeep(cfg, cfgWithEnv);
	}

	/** Returns the configuration. Includes environment variables. */
	static get(): ConfigurationSettings {
		if (!this._config) {
			this.create();
		}

		return this._config;
	}

	/** Validates the configuration (including environment variables) and throws an error, if it is invalid. */
	static validate(): void {
		if (!this._config) {
			this.create();
		}

		try {
			configSchema.validateSync(this._config, { abortEarly: false });
		} catch (error) {
			console.error(
				"The configuration contains invalid/missing fields. Please check your configuration for typos and invalid/missing values. (Note: Environment variables overwrite config values and were already considered for the validation.)"
			);
			if (error instanceof y.ValidationError) {
				error.errors.forEach((message, index) => {
					console.error(`Invalid #${index + 1}: ${message}`);
				});
			}
			throw new Error("Config is invalid.");
		}
	}
}

const server = y
	.object({
		basePath: y.string().required(),
		port: y.number().integer().positive().required()
	})
	.required();

const db = y
	.object({
		type: y.string().required(),
		port: y.number().integer().positive().required(),
		database: y.string().required(),
		host: y.string().required(),
		username: y.string().required(),
		password: y.string().required(),
		synchronize: y.boolean().required(),
		dropSchema: y.boolean().required()
	})
	.required();

const authentication = y.object({
	issuerUrl: y.string().required(),
	jwksUrl: y.string().required()
});

const mailing = y
	.object({
		enabled: y.boolean().required(),
		clientBasePath: y.string().when("enabled", {
			is: true,
			then: y.string().required()
		}),
		from: y.string().when("enabled", {
			is: true,
			then: y.string().required()
		}),
		smtp: y
			.object({
				host: y.string().required(),
				port: y.number().integer().required(),
				useSecureConnection: y.boolean().required(),
				username: y.string().required(),
				password: y.string()
			})
			.when("enabled", {
				is: false,
				then: y.object().notRequired().default(undefined)
			})
	})
	.required();

const notifications = y.object({
	enabled: y.boolean().required(),
	subscribers: y.array().of(
		y.object({
			courseId: y.string().required(),
			name: y.string().required(),
			url: y.string().required(),
			events: y.string().required()
		})
	)
});

const logger = y.object({
	levels: y.array().of(y.string().oneOf(["log", "verbose", "debug", "warn", "error"])),
	requests: y.boolean(),
	dbErrors: y.boolean()
});

/**
 * Object containing validation schemas for all parts of the configuration.
 * Exported to enable testing of individual schemas.
 */
export const configValidationSchemas = {
	server,
	db,
	authentication,
	notifications,
	mailing,
	logger
};

export const configSchema = y.object(configValidationSchemas).required();

export type ConfigurationSettings = y.InferType<typeof configSchema>;
