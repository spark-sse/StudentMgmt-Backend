import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { environment } from "../.config/environment";
import { UserRepository } from "../user/repositories/user.repository";
import { CacheService } from "./cache.service";
import { AuthController } from "./controllers/auth.controller";
import { AuthGuard } from "./guards/auth.guard";
import { AuthStrategy } from "./guards/auth.strategy";
import { OAuthStrategy } from "./guards/oauth.strategy";
import { RoleGuard } from "./guards/role.guard";
import { TestUserAuthStrategy } from "./guards/test-user-auth.strategy";
// import { SessionSerializer } from "./oauth.strategy";
import { AuthService } from "./services/auth.service";

@Module({
	imports: [TypeOrmModule.forFeature([UserRepository]), HttpModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		CacheService,
		RoleGuard,
		AuthGuard,
		OAuthStrategy,
		{
			provide: AuthStrategy,
			useClass: environment.is("development", "demo", "testing")
				? TestUserAuthStrategy
				: OAuthStrategy
		}
	],
	exports: [AuthGuard, AuthStrategy, HttpModule, AuthService]
})
export class AuthModule {}
