/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Answers = "answers",
	Questions = "questions",
	Retrospectives = "retrospectives",
	Users = "users",
	Votes = "votes",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AnswersRecord = {
	creator: RecordIdString
	details: string
	votes?: RecordIdString[]
}

export type QuestionsRecord = {
	title: string
	answers?: RecordIdString[]
}

export enum RetrospectivesStateOptions {
	"draft" = "draft",
	"published" = "published",
	"in-progress" = "in-progress",
	"finished" = "finished",
}
export type RetrospectivesRecord = {
	title: string
	details?: string
	scheduled?: IsoDateString
	state: RetrospectivesStateOptions
	organizers: RecordIdString[]
	attendees?: RecordIdString[]
	questions?: RecordIdString[]
}

export type UsersRecord = {
	name?: string
	avatar?: string
}

export type VotesRecord = {
	user: RecordIdString
}

// Response types include system fields and match responses from the PocketBase API
export type AnswersResponse<Texpand = unknown> = Required<AnswersRecord> & BaseSystemFields<Texpand>
export type QuestionsResponse<Texpand = unknown> = Required<QuestionsRecord> & BaseSystemFields<Texpand>
export type RetrospectivesResponse<Texpand = unknown> = Required<RetrospectivesRecord> & BaseSystemFields<Texpand>
export type UsersResponse = Required<UsersRecord> & AuthSystemFields
export type VotesResponse<Texpand = unknown> = Required<VotesRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	answers: AnswersRecord
	questions: QuestionsRecord
	retrospectives: RetrospectivesRecord
	users: UsersRecord
	votes: VotesRecord
}

export type CollectionResponses = {
	answers: AnswersResponse
	questions: QuestionsResponse
	retrospectives: RetrospectivesResponse
	users: UsersResponse
	votes: VotesResponse
}