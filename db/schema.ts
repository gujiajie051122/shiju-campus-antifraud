import {index, integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

// Operational metadata only: no conversations, API keys, email or raw user IDs.
export const aiRequests=sqliteTable("ai_requests",{
 requestId:text("request_id").primaryKey(),
 actorHash:text("actor_hash").notNull(),
 day:text("day").notNull(),
 feature:text("feature").notNull(),
 model:text("model").notNull(),
 startedAt:integer("started_at").notNull(),
 leaseUntil:integer("lease_until").notNull(),
 finishedAt:integer("finished_at"),
 outcome:text("outcome").notNull(),
 httpStatus:integer("http_status"),
 promptTokens:integer("prompt_tokens"),
 completionTokens:integer("completion_tokens"),
 totalTokens:integer("total_tokens"),
},table=>[
 index("ai_requests_day").on(table.day),
 index("ai_requests_actor_day").on(table.actorHash,table.day),
 index("ai_requests_actor_started").on(table.actorHash,table.startedAt),
 index("ai_requests_active").on(table.outcome,table.leaseUntil),
]);
