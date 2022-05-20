import { GameModeName } from "./game_mode";
import { Timestamp } from "./timestamp";

export type EventType = "rank" | "disqualify" | "qualify" | "nominate" | "love";

export interface InterOpEvent {
	modes: GameModeName[];
	obviousness: number | null;
	severity: number | null;
	isBnOrNat: boolean;
	isUnique: boolean;
	responsibleNominators: [];
	isReviewed: boolean;
	_id: string;
	type: EventType;
	timestamp: Timestamp;
	beatmapsetId: number;
	creatorId: number;
	creatorName: string;
	discussionId: number | null;
	userId: number | null;
	artistTitle: string;
	content: string | null;
	id: string;
}

export interface InterOpEventResponse {
	status: number;
	data: InterOpEvent[];
}
