import { Subject, Lesson, RevisionNote, AppConfig } from '../types';

export const initialConfig: AppConfig = {
  exam_date: '2026-12-08T00:00:00.000Z',
  exam_title: 'G.C.E. O/L Examination 2026/2027',
};

export const initialSubjects: Subject[] = [
  { id: 'sub-science', name: 'Science', category: 'Main', available_grades: 'both', icon_name: 'Atom' },
  { id: 'sub-maths', name: 'Mathematics', category: 'Main', available_grades: 'both', icon_name: 'Calculator' },
  { id: 'sub-history', name: 'History', category: 'Main', available_grades: 'both', icon_name: 'Landmark' },
  { id: 'sub-sinhala', name: 'Sinhala Language & Lit.', category: 'Main', available_grades: 'both', icon_name: 'BookOpen' },
  { id: 'sub-english', name: 'English Language', category: 'Main', available_grades: 'both', icon_name: 'Languages' },
  { id: 'sub-religion', name: 'Buddhism / Religion', category: 'Main', available_grades: 'both', icon_name: 'Compass' },
  { id: 'sub-ict', name: 'Info & Comm Technology (ICT)', category: 'Bucket1', available_grades: 'both', icon_name: 'Laptop' },
  { id: 'sub-commerce', name: 'Commerce & Accounting', category: 'Bucket1', available_grades: 'both', icon_name: 'TrendingUp' },
];

export const initialLessons: Lesson[] = [
  { id: 'les-sci11-1', subject_id: 'sub-science', grade: '11', lesson_name: '1. Biological Processes in Humans', lesson_order: 1 },
  { id: 'les-sci11-3', subject_id: 'sub-science', grade: '11', lesson_name: '3. Newton Laws of Motion & Momentum', lesson_order: 3 },
];

export const initialNotes: RevisionNote[] = [
  {
    id: 'note-1',
    author_name: 'Kamal Perera',
    subject_id: 'sub-science',
    subject_name: 'Science',
    lesson_id: 'les-sci11-3',
    lesson_name: '3. Newton Laws of Motion & Momentum',
    grade: '11',
    title: 'Newton 3 Laws of Motion Quick Revision Sheet',
    content: '<p>A quick summary of Newton laws.</p>',
    helpful_count: 34,
    helpful_voters: [],
    status: 'Approved',
    created_at: '2026-07-20T10:30:00.000Z',
  },
];
