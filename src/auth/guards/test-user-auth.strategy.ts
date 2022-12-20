import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { DtoFactory } from "../../shared/dto-factory";
import { UserDto } from "../../shared/dto/user.dto";
import { UserRepository } from "../../user/repositories/user.repository";
import { CacheService } from "../cache.service";
import { AuthStrategy } from "./auth.strategy";
import { OAuthStrategy } from "./oauth.strategy";

const jwtRegex = /^.+\..+\..+$/; // Matches JWT, i.e., xxxxx.yyyyy.zzzzz

@Injectable()
export class TestUserAuthStrategy extends AuthStrategy {
	constructor(
		private cache: CacheService,
		private oauth: OAuthStrategy,
		@InjectRepository(UserRepository) private userRepository: UserRepository
	) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const username = this.validateAuthHeader(request.headers.authorization);

		if (this.isJwt(username)) {
			// Allow authentication via auth provider, if user supplied a JWT
			return this.oauth.canActivate(context);
		}

		let user = this.cache.get<UserDto>(username);

		if (!user) {
			const testUser = await this.userRepository.tryGetUserByUsername(username);

			if (!testUser) {
				throw new UnauthorizedException("Unknown username: " + username);
			}

			user = DtoFactory.createUserDto(testUser);
			this.cache.set(username, user);
		}

		request["user"] = user;
		return true;
	}

	isJwt(token: string): boolean {
		return jwtRegex.test(token);
	}
}
