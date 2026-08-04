export type SubjectCategory = 'Main' | 'Bucket1' | 'Bucket2' | 'Bucket3';
export type GradeOption = '10' | '11' | 'both';

export interface Subject {
  id: string;
  name: string;
  category: SubjectCategory;
  available_grades: GradeOption;
  icon_name?: string;
}

export interface Lesson {
  id: string;
  subject_id: string;
  grade: '10' | '11';
  lesson_name: string;
  lesson_order: number;
}

export type NoteStatus = 'Pending' | 'Approved' | 'Rejected';
export type AttachmentType = 'image' | 'pdf';

export interface NoteAttachment {
  id: string;
  type: AttachmentType;
  data: string; // base64 data URL
  name: string;
}

export interface RevisionNote {
  id: string;
  author_name: string; // e.g. "Kasun P." or "Anonymous"
  subject_id: string;
  subject_name: string;
  lesson_id: string;
  lesson_name: string;
  grade: '10' | '11';
  title: string;
  content: string; // Rich text HTML string
  attachments?: NoteAttachment[]; // Array of multiple attachments
  attachment_type?: AttachmentType; // Backwards compatibility for single attachment notes
  attachment_data?: string; // base64 data URL
  attachment_name?: string;
  helpful_count: number;
  helpful_voters: string[]; // array of voter tokens
  status: NoteStatus;
  rejection_reason?: string;
  created_at: string;
}

export interface AppConfig {
  exam_date: string; // ISO Date String
  exam_title: string;
}

export type NavigationBreadcrumb = {
  label: string;
  view: string;
  params?: Record<string, any>;
};

export function getNoteAttachments(note: RevisionNote): NoteAttachment[] {
  if (note.attachments && note.attachments.length > 0) {
    return note.attachments;
  }
  if (note.attachment_data) {
    return [
      {
        id: 'legacy-att-1',
        type: note.attachment_type || 'pdf',
        data: note.attachment_data,
        name: note.attachment_name || 'Attached Document',
      },
    ];
  }
  return [];
}
