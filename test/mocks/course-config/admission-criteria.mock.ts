import { OverallPercentRuleDto, PassedXPercentWithAtLeastYPercentRuleDto } from "../../../src/admission-status/dto/admission-rule.dto";
import { RuleType } from "../../../src/admission-status/rules/abstract-rules";
import { AdmissionCriteriaDto } from "../../../src/course/dto/course-config/admission-criteria.dto";
import { AssignmentType } from "../../../src/shared/enums";
import { RoundingType } from "../../../src/utils/math";

const ADMISSION_RULE_HOMEWORK_OVERALL_50_PERCENT_ROUNDING_NEXT_INTEGER: OverallPercentRuleDto = {
	type: RuleType.REQUIRED_PERCENT_OVERALL,
	assignmentType: AssignmentType.HOMEWORK,
	requiredPercent: 50,
	achievedPercentRounding: {
		type: RoundingType.UP_NEAREST_INTEGER
	},
};

const ADMISSION_RULE_TESTAT_OVERALL_50_PERCENT_ROUNDING_NEXT_INTEGER: OverallPercentRuleDto = {
	type: RuleType.REQUIRED_PERCENT_OVERALL,
	assignmentType: AssignmentType.TESTAT,
	requiredPercent: 50,
	achievedPercentRounding: {
		type: RoundingType.DECIMALS,
		decimals: 0
	},
};

const ADMISSION_RULE_HOMEWORK_PASSED_X_PERCENT_WITH_AT_LEAST_Y_PERCENT: PassedXPercentWithAtLeastYPercentRuleDto = {
	type: RuleType.PASSED_X_PERCENT_WITH_AT_LEAST_Y_PERCENT,
	assignmentType: AssignmentType.HOMEWORK,
	requiredPercent: 50,
	achievedPercentRounding: {
		type: RoundingType.NONE,
	},
	passedAssignmentsPercent: 70,
	passedAssignmentsRounding: {
		type: RoundingType.DOWN_NEAREST_INTEGER,
	}

};

export const ADMISSION_CRITERIA_MOCK: AdmissionCriteriaDto = {
	rules: [
		ADMISSION_RULE_HOMEWORK_OVERALL_50_PERCENT_ROUNDING_NEXT_INTEGER,
		ADMISSION_RULE_TESTAT_OVERALL_50_PERCENT_ROUNDING_NEXT_INTEGER,
		ADMISSION_RULE_HOMEWORK_PASSED_X_PERCENT_WITH_AT_LEAST_Y_PERCENT
	]
};
