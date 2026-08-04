import { pgTable, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const subjects = pgTable('subjects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  availableGrades: text('available_grades').notNull(),
  iconName: text('icon_name'),
});

export const lessons = pgTable('lessons', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').notNull(),
  grade: text('grade').notNull(),
  lessonName: text('lesson_name').notNull(),
  lessonOrder: integer('lesson_order').notNull(),
});

export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  authorName: text('author_name').notNull(),
  subjectId: text('subject_id').notNull(),
  subjectName: text('subject_name').notNull(),
  lessonId: text('lesson_id').notNull(),
  lessonName: text('lesson_name').notNull(),
  grade: text('grade').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  helpfulCount: integer('helpful_count').notNull().default(0),
  status: text('status').notNull().default('Pending'),
  rejectionReason: text('rejection_reason'),
  createdAt: text('created_at').notNull(),
});

export const noteAttachments = pgTable('note_attachments', {
  id: text('id').primaryKey(),
  noteId: text('note_id').notNull(),
  type: text('type').notNull(),
  name: text('name').notNull(),
  data: text('data'), // base64 or URL
  filePath: text('file_path'),
});

export const noteVotes = pgTable('note_votes', {
  noteId: text('note_id').notNull(),
  voterToken: text('voter_token').notNull(),
}, (table) => [
  primaryKey({ columns: [table.noteId, table.voterToken] }),
]);

export const appConfig = pgTable('app_config', {
  id: text('id').primaryKey().default('main'),
  examDate: text('exam_date').notNull(),
  examTitle: text('exam_title').notNull(),
});

export const adminUsers = pgTable('admin_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
});
