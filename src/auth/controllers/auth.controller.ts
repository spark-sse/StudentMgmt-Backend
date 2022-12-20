import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserDto } from "../../shared/dto/user.dto";
import { GetUser } from "../decorators/get-user.decorator";
import { AuthGuard } from "../guards/auth.guard";
import { AuthService } from "../services/auth.service";

@ApiBearerAuth()
@ApiTags("authentication")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get("whoAmI")
	@ApiOperation({
		operationId: "whoAmI",
		summary: "Get user.",
		description: "Returns the authenticated user."
	})
	@UseGuards(AuthGuard)
	async whoAmI(@GetUser() user: UserDto): Promise<UserDto> {
		return this.authService.getUserById(user.id);
	}
}
