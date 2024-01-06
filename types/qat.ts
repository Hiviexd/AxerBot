import { GameModeName } from "./game_mode";
import { Timestamp } from "./timestamp";

export type EventType = "nominate" | "qualify" | "disqualify" | "nomination_reset";

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

export interface BeatmapEvent {
    modes: GameModeName[];
    _id: string;
    timestamp: Timestamp;
    beatmapsetId: number;
    creatorId: number;
    creatorName: string;
    artistTitle: string;
    id: string;
}

export interface Nomination {
    _id: string;
    type: EventType;
    timestamp: Timestamp;
    beatmapsetId: number;
    creatorId: number;
    creatorName: string;
    modes: GameModeName[];
    discussionId: number | null;
    userId: number;
    artistTitle: string;
    content: string | null;
    genre: string;
    language: string;
}

export interface NominationReset {
    _id: string;
    type: EventType;
    timestamp: Timestamp;
    beatmapsetId: number;
    creatorId: number;
    creatorName: string;
    modes: GameModeName[];
    discussionId: number | null;
    userId: number;
    content: string | null;
    genre: string;
    language: string;
    __v?: number;
    createdAt?: Timestamp;
    isBnOrNat?: boolean;
    isReviewed?: boolean;
    isUnique?: boolean;
    responsibleNominators?: [];
    updatedAt?: Timestamp;
    obviousness?: number | null;
    severity?: number | null;
}

export interface QACheck {
    _id: string;
    user: string;
    event: BeatmapEvent;
    timestamp: Timestamp;
    mode: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    __v: number;
    comment?: string;
    id: string;
}

export interface DisqualifiedQACheck {
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
    genre: string;
    language: string;
    __v: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    qaComment?: string | null;
    id: string;
}

export interface UserActivity {
    uniqueNominations: Nomination[];
    nominationsDisqualified: NominationReset[]; // ? dqs recieved
    nominationsPopped: NominationReset[]; // ? pops recieved
    disqualifications: NominationReset[]; // ? dqs done by user
    pops: NominationReset[]; // ? pops done by user
    qualityAssuranceChecks: QACheck[];
    disqualifiedQualityAssuranceChecks: DisqualifiedQACheck[];
}

export interface UserActivityResponse {
    status: number;
    data: UserActivity;
}

export interface QatUserModesInfo {
    mode: string;
    level: string;
}

export interface QatUserHistory {
    group: string;
    date: Timestamp;
    mode: string;
    kind: string;
    relatedEvaluation?: string | null;
}

export interface QatUser {
    groups: string[];
    isVetoMediator: boolean;
    isBnEvaluator: boolean;
    inBag: boolean;
    isTrialNat: boolean;
    bnProfileBadge: number;
    natProfileBadge: number;
    rankedBeatmapsets: number;
    requestStatus: string[];
    genrePreferences: string[];
    genreNegativePreferences: string[];
    languagePreferences: string[];
    languageNegativePreferences: string[];
    osuStylePreferences: string[];
    osuStyleNegativePreferences: string[];
    taikoStylePreferences: string[];
    taikoStyleNegativePreferences: string[];
    catchStylePreferences: string[];
    catchStyleNegativePreferences: string[];
    maniaStylePreferences: string[];
    maniaStyleNegativePreferences: string[];
    maniaKeymodePreferences: string[];
    maniaKeymodeNegativePreferences: string[];
    detailPreferences: string[];
    detailNegativePreferences: string[];
    mapperPreferences: string[];
    mapperNegativePreferences: string[];
    isBnFinderAnonymous: boolean;
    _id: string;
    osuId: number;
    username: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    __v: number;
    modesInfo: QatUserModesInfo[];
    history: QatUserHistory[];
    isFeatureTester: boolean;
    requestLink: string;
    stylePreferences: string[];
    isNat: boolean;
    isBn: boolean;
    isBnOrNat: boolean;
    hasBasicAccess: boolean;
    hasFullReadAccess: boolean;
    isNatOrTrialNat: boolean;
    modes: string[];
    fullModes: string[];
    probationModes: string[];
    bnDuration: number;
    natDuration: number;
    requestInfo: string;
    id: string;
}

export type QatEventType = "qualify" | "disqualify" | "nominate" | "nomination_reset";

export interface QatEvent {
    modes: string[];
    obviousness: number;
    severity: number;
    isBnOrNat: boolean;
    isUnique: boolean;
    responsibleNominators: [];
    isReviewed: boolean;
    _id: string;
    type: QatEventType;
    timestamp: Timestamp;
    beatmapsetId: number;
    creatorId: number;
    creatorName: string;
    discussionId: number;
    userId: number;
    artistTitle: string;
    content: string;
    genre: string;
    language: string;
    __v: 1;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    id: string;
}

export interface QatUserResponse {
    status: number;
    data: QatUser;
}

export interface QatAllUsersResponse {
    status: number;
    data: QatUser[];
}

export interface HTTPResponse<DataType> {
    status: number;
    data: DataType | null;
}
