import { GroupSettingsDto } from "../../../src/course/dto/course-config/group-settings.dto";

export const GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF: GroupSettingsDto = {
	allowGroups: true,
	nameSchema: "JAVA-",
	sizeMin: 2,
	sizeMax: 3,
	selfmanaged: true,
};

export const GROUP_SETTINGS_NO_GROUPS: GroupSettingsDto = {
	allowGroups: false,
	nameSchema: null,
	sizeMin: 0,
	sizeMax: 0,
	selfmanaged: false,
};

export const GROUP_SETTINGS_GROUPS_ALLOWED_NOT_SELF: GroupSettingsDto = {
	allowGroups: true,
	nameSchema: "JAVA-",
	sizeMin: 2,
	sizeMax: 3,
	selfmanaged: false,
};

export const GROUP_SETTINGS_MOCK: GroupSettingsDto[] = [
	GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF,
	GROUP_SETTINGS_NO_GROUPS,
	GROUP_SETTINGS_GROUPS_ALLOWED_NOT_SELF
];
