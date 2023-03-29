/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Action = "action",
	Answer = "answer",
	Question = "question",
	Retrospective = "retrospective",
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

export enum ActionStatusOptions {
	"draft" = "draft",
	"in-progress" = "in-progress",
	"completed" = "completed",
	"cancelled" = "cancelled",
}
export type ActionRecord = {
	title: string
	description?: string
	retrospective: RecordIdString
	assignees?: RecordIdString[]
	status: ActionStatusOptions
}

export type AnswerRecord = {
	content?: string
	user: RecordIdString
	question: RecordIdString
}

export type QuestionRecord = {
	title: string
	creator: RecordIdString
	retrospective: RecordIdString
}

export enum RetrospectiveStateOptions {
	"draft" = "draft",
	"published" = "published",
}
export type RetrospectiveRecord = {
	organizer: RecordIdString
	description?: string
	name: string
	participants?: RecordIdString[]
	scheduled?: IsoDateString
	inviteLink?: string
	state: RetrospectiveStateOptions
}

export type UsersRecord = {
	name?: string
	avatar?: string
}

// Response types include system fields and match responses from the PocketBase API
export type ActionResponse<Texpand = unknown> = ActionRecord & BaseSystemFields<Texpand>
export type AnswerResponse<Texpand = unknown> = AnswerRecord & BaseSystemFields<Texpand>
export type QuestionResponse<Texpand = unknown> = QuestionRecord & BaseSystemFields<Texpand>
export type RetrospectiveResponse<Texpand = unknown> = RetrospectiveRecord & BaseSystemFields<Texpand>
export type UsersResponse = UsersRecord & AuthSystemFields

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	action: ActionRecord
	answer: AnswerRecord
	question: QuestionRecord
	retrospective: RetrospectiveRecord
	users: UsersRecord
}

export type CollectionResponses = {
	action: ActionResponse
	answer: AnswerResponse
	question: QuestionResponse
	retrospective: RetrospectiveResponse
	users: UsersResponse
}
