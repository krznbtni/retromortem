/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Actions = "actions",  
	Answers = "answers",
	Questions = "questions",
	Retrospectives = "retrospectives",
	Users = "users",  
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

export enum ActionsStatusOptions {
	"draft" = "draft",
	"in-progress" = "in-progress",
	"completed" = "completed",
	"cancelled" = "cancelled",
}
export type ActionsRecord = {
	title: string
	description?: string
	retrospective: RecordIdString
	assignees?: RecordIdString[]
	status: ActionsStatusOptions
}

export type AnswersRecord = {
	content?: string
	user: RecordIdString
	question: RecordIdString
}

export type QuestionsRecord = {
	title: string
	creator: RecordIdString
	retrospective: RecordIdString
}

export enum RetrospectivesStateOptions {
	"draft" = "draft",
	"published" = "published",
}
export type RetrospectivesRecord = {
	organizer: RecordIdString
	description?: string
	name: string
	participants?: RecordIdString[]
	scheduled?: IsoDateString
	inviteLink?: string
	state: RetrospectivesStateOptions
}

export type UsersRecord = {
	name?: string
	avatar?: string
}

// Response types include system fields and match responses from the PocketBase API
export type ActionsResponse<Texpand = unknown> = ActionsRecord & BaseSystemFields<Texpand>
export type AnswersResponse<Texpand = unknown> = AnswersRecord & BaseSystemFields<Texpand>
export type QuestionsResponse<Texpand = unknown> = QuestionsRecord & BaseSystemFields<Texpand>
export type RetrospectivesResponse<Texpand = unknown> = RetrospectivesRecord & BaseSystemFields<Texpand>
export type UsersResponse = UsersRecord & AuthSystemFields

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	actions: ActionsRecord
	answers: AnswersRecord
	questions: QuestionsRecord
	retrospectives: RetrospectivesRecord
	users: UsersRecord
}

export type CollectionResponses = {
	actions: ActionsResponse
	answers: AnswersResponse
	questions: QuestionsResponse
	retrospectives: RetrospectivesResponse
	users: UsersResponse
}
