type EnvironmentName = "development" | "demo" | "production" | "testing";

type EnvironmentVariable =
	| "NODE_ENV"
	| "LOG_CONFIG"
	| "AUTH_ISSUER_URL"
	| "AUTH_JWKS_URL"
	| "AUTH_CLIENT_ID"
	| "AUTH_CLIENT_SECRET"
	| "SERVER_BASE_PATH"
	| "SERVER_PORT"
	| "CLIENT_BASE_PATH"
	| "DB_TYPE"
	| "DB_HOST"
	| "DB_PORT"
	| "DB_DATABASE"
	| "DB_USERNAME"
	| "DB_PASSWORD"
	| "TYPEORM_SYNC"
	| "SMTP_HOST"
	| "SMTP_PORT"
	| "SMTP_SECURE"
	| "SMTP_USERNAME"
	| "SMTP_PASSWORD"
	| "MAIL_FROM";

/**
 * Contains the possible environments that this application might run in, as well as
 * some utility methods for checking the current environment.
 *
 * See the `/config` directory to view the corresponding configuration settings.
 */
export const environment = {
	development: "development",
	demo: "demo",
	production: "production",
	testing: "testing",

	/**
	 * Determines, whether the current environment is one of the specified environments.
	 *
	 * @param environments One or multiple environment names.
	 * @returns `true`, if the current environment is one of the given environments.
	 */
	is: (...environments: EnvironmentName[]): boolean =>
		(environments as string[]).includes(process.env.NODE_ENV)
} as const;

/** Returns the value of an environment variable or `undefined`. */
export function env(variable: EnvironmentVariable): string {
	return process.env[variable];
}
