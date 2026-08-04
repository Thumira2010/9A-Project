import { Subject, Lesson, RevisionNote, AppConfig } from '../types';

const STORAGE_KEYS = {
  ADMIN_AUTH: 'ol_revision_admin_auth_v2',
};

const DEFAULT_CONFIG: AppConfig = {
  exam_date: '2026-12-08T00:00:00.000Z',
  exam_title: 'G.C.E. O/L Examination 2026',
};

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub-science', name: 'Science', category: 'Main', available_grades: 'both', icon_name: 'Atom' },
  { id: 'sub-maths', name: 'Mathematics', category: 'Main', available_grades: 'both', icon_name: 'Calculator' },
  { id: 'sub-history', name: 'History', category: 'Main', available_grades: 'both', icon_name: 'Landmark' },
  { id: 'sub-sinhala', name: 'Sinhala Language & Lit.', category: 'Main', available_grades: 'both', icon_name: 'BookOpen' },
  { id: 'sub-english', name: 'English Language', category: 'Main', available_grades: 'both', icon_name: 'Languages' },
  { id: 'sub-religion', name: 'Buddhism / Religion', category: 'Main', available_grades: 'both', icon_name: 'Compass' },
  { id: 'sub-ict', name: 'Info & Comm Technology (ICT)', category: 'Bucket1', available_grades: 'both', icon_name: 'Laptop' },
  { id: 'sub-commerce', name: 'Commerce & Accounting', category: 'Bucket1', available_grades: 'both', icon_name: 'TrendingUp' },
  { id: 'sub-health', name: 'Health & Physical Education', category: 'Bucket2', available_grades: 'both', icon_name: 'Activity' },
  { id: 'sub-geography', name: 'Geography', category: 'Bucket2', available_grades: 'both', icon_name: 'Globe' },
  { id: 'sub-art', name: 'Art & Aesthetics', category: 'Bucket3', available_grades: 'both', icon_name: 'Palette' },
  { id: 'sub-music', name: 'Music (Eastern/Western)', category: 'Bucket3', available_grades: 'both', icon_name: 'Music' },
];

const DEFAULT_LESSONS: Lesson[] = [
  { id: 'les-sci11-1', subject_id: 'sub-science', grade: '11', lesson_name: '1. Biological Processes in Humans (Nutrition & Digestion)', lesson_order: 1 },
  { id: 'les-sci11-2', subject_id: 'sub-science', grade: '11', lesson_name: '2. Chemical Bonds & Intermolecular Forces', lesson_order: 2 },
  { id: 'les-sci11-3', subject_id: 'sub-science', grade: '11', lesson_name: '3. Newton Laws of Motion & Momentum', lesson_order: 3 },
  { id: 'les-sci11-4', subject_id: 'sub-science', grade: '11', lesson_name: '4. Electricity & Current Characteristics', lesson_order: 4 },
  { id: 'les-sci11-5', subject_id: 'sub-science', grade: '11', lesson_name: '5. Genetics & Heredity Principles', lesson_order: 5 },
  { id: 'les-sci10-1', subject_id: 'sub-science', grade: '10', lesson_name: '1. Chemical Foundation of Life', lesson_order: 1 },
  { id: 'les-sci10-2', subject_id: 'sub-science', grade: '10', lesson_name: '2. Structure of Matter & Atomic Theory', lesson_order: 2 },
  { id: 'les-sci10-3', subject_id: 'sub-science', grade: '10', lesson_name: '3. Motion in a Straight Line', lesson_order: 3 },
  { id: 'les-math11-1', subject_id: 'sub-maths', grade: '11', lesson_name: '1. Real Numbers & Logarithms', lesson_order: 1 },
  { id: 'les-math11-2', subject_id: 'sub-maths', grade: '11', lesson_name: '2. Quadratic Equations & Inequalities', lesson_order: 2 },
  { id: 'les-math11-3', subject_id: 'sub-maths', grade: '11', lesson_name: '3. Perimeter & Area of Circle Sectors', lesson_order: 3 },
  { id: 'les-math11-4', subject_id: 'sub-maths', grade: '11', lesson_name: '4. Trigonometry & Heights and Distances', lesson_order: 4 },
  { id: 'les-hist11-1', subject_id: 'sub-history', grade: '11', lesson_name: '1. British Colonial Rule in Sri Lanka (1796-1948)', lesson_order: 1 },
  { id: 'les-hist11-2', subject_id: 'sub-history', grade: '11', lesson_name: '2. Constitutional Reforms & Independence Movement', lesson_order: 2 },
  { id: 'les-ict11-1', subject_id: 'sub-ict', grade: '11', lesson_name: '1. Data Representation & Number Systems', lesson_order: 1 },
  { id: 'les-ict11-2', subject_id: 'sub-ict', grade: '11', lesson_name: '2. Logic Gates & Boolean Algebra', lesson_order: 2 },
  { id: 'les-ict11-3', subject_id: 'sub-ict', grade: '11', lesson_name: '3. Fundamentals of Pascal / Python Programming', lesson_order: 3 },
];

const DEFAULT_NOTES: RevisionNote[] = [
  {
    id: 'note-1',
    author_name: 'Kamal Perera',
    subject_id: 'sub-science',
    subject_name: 'Science',
    lesson_id: 'les-sci11-3',
    lesson_name: '3. Newton Laws of Motion & Momentum',
    grade: '11',
    title: 'Newton 3 Laws of Motion Quick Revision Sheet',
    content: `<h2>Summary of Newton's Laws</h2><p>A quick, exam-oriented summary for G.C.E. O/L Physics questions.</p>`,
    helpful_count: 34,
    helpful_voters: [],
    status: 'Approved',
    created_at: '2026-07-20T10:30:00.000Z',
  },
];

// In-Memory Synchronous Caches initialized with defaults
let cachedSubjects: Subject[] = DEFAULT_SUBJECTS;
let cachedLessons: Lesson[] = DEFAULT_LESSONS;
let cachedNotes: RevisionNote[] = DEFAULT_NOTES;
let cachedConfig: AppConfig = DEFAULT_CONFIG;
let isInitialized = false;

// Storage Listeners
type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export function subscribeToStorage(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

// Initial Data Fetch from Express Server
export async function syncWithServer(): Promise<void> {
  try {
    const [subRes, lesRes, noteRes, cfgRes] = await Promise.all([
      fetch('/api/subjects'),
      fetch('/api/lessons'),
      fetch('/api/notes'),
      fetch('/api/config'),
    ]);

    if (subRes.ok) cachedSubjects = await subRes.json();
    if (lesRes.ok) cachedLessons = await lesRes.json();
    if (noteRes.ok) cachedNotes = await noteRes.json();
    if (cfgRes.ok) cachedConfig = await cfgRes.json();

    isInitialized = true;
    notifyListeners();
  } catch (err) {
    console.warn('Failed to sync with server API:', err);
  }
}

// Trigger initial sync automatically
syncWithServer();

export function initializeStorage(): void {
  if (!isInitialized) {
    syncWithServer();
  }
}

// Admin Authentication State
export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

export async function loginAdmin(email: string, pass: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    if (res.ok) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      notifyListeners();
      return true;
    }
  } catch (err) {
    console.error('Admin login failed:', err);
  }
  return false;
}

export function logoutAdmin(): void {
  fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  notifyListeners();
}

// Subject getters & modifiers
export function getSubjects(): Subject[] {
  return cachedSubjects;
}

export async function saveSubject(subject: Subject): Promise<void> {
  const existingIdx = cachedSubjects.findIndex((s) => s.id === subject.id);
  if (existingIdx >= 0) {
    cachedSubjects[existingIdx] = subject;
  } else {
    cachedSubjects.push(subject);
  }
  notifyListeners();

  try {
    await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subject),
    });
  } catch (err) {
    console.error('Failed to save subject to API:', err);
  }
}

export async function deleteSubject(subjectId: string): Promise<void> {
  cachedSubjects = cachedSubjects.filter((s) => s.id !== subjectId);
  cachedLessons = cachedLessons.filter((l) => l.subject_id !== subjectId);
  cachedNotes = cachedNotes.filter((n) => n.subject_id !== subjectId);
  notifyListeners();

  try {
    await fetch(`/api/subjects/${subjectId}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Failed to delete subject from API:', err);
  }
}

// Lesson getters & modifiers
export function getLessons(): Lesson[] {
  return cachedLessons;
}

export async function saveLesson(lesson: Lesson): Promise<void> {
  const existingIdx = cachedLessons.findIndex((l) => l.id === lesson.id);
  if (existingIdx >= 0) {
    cachedLessons[existingIdx] = lesson;
  } else {
    cachedLessons.push(lesson);
  }
  notifyListeners();

  try {
    await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lesson),
    });
  } catch (err) {
    console.error('Failed to save lesson to API:', err);
  }
}

export async function updateLessonOrders(updatedLessons: Lesson[]): Promise<void> {
  const map = new Map(updatedLessons.map((l) => [l.id, l]));
  cachedLessons = cachedLessons.map((l) => map.get(l.id) || l);
  notifyListeners();

  try {
    await fetch('/api/lessons/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedLessons),
    });
  } catch (err) {
    console.error('Failed to reorder lessons in API:', err);
  }
}

export async function deleteLesson(lessonId: string): Promise<void> {
  cachedLessons = cachedLessons.filter((l) => l.id !== lessonId);
  cachedNotes = cachedNotes.filter((n) => n.lesson_id !== lessonId);
  notifyListeners();

  try {
    await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Failed to delete lesson from API:', err);
  }
}

// Revision Notes getters & modifiers
export function getNotes(): RevisionNote[] {
  return cachedNotes;
}

export async function saveNote(note: RevisionNote): Promise<void> {
  const existingIdx = cachedNotes.findIndex((n) => n.id === note.id);
  if (existingIdx >= 0) {
    cachedNotes[existingIdx] = note;
  } else {
    cachedNotes.unshift(note);
  }
  notifyListeners();

  try {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
  } catch (err) {
    console.error('Failed to save note to API:', err);
  }
}

export async function updateNoteStatus(noteId: string, status: 'Approved' | 'Rejected', reason?: string): Promise<void> {
  const note = cachedNotes.find((n) => n.id === noteId);
  if (note) {
    note.status = status;
    if (reason) note.rejection_reason = reason;
    notifyListeners();
  }

  try {
    await fetch(`/api/notes/${noteId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejection_reason: reason }),
    });
  } catch (err) {
    console.error('Failed to update note status in API:', err);
  }
}

export function toggleNoteHelpful(noteId: string, voterToken: string): boolean {
  const note = cachedNotes.find((n) => n.id === noteId);
  if (!note) return false;

  if (!note.helpful_voters) note.helpful_voters = [];

  const alreadyVoted = note.helpful_voters.includes(voterToken);
  if (alreadyVoted) {
    note.helpful_voters = note.helpful_voters.filter((t) => t !== voterToken);
    note.helpful_count = Math.max(0, note.helpful_count - 1);
  } else {
    note.helpful_voters.push(voterToken);
    note.helpful_count += 1;
  }
  notifyListeners();

  fetch(`/api/notes/${noteId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voter_token: voterToken }),
  }).catch((err) => console.error('Failed to vote note in API:', err));

  return !alreadyVoted;
}

export async function deleteNote(noteId: string): Promise<void> {
  cachedNotes = cachedNotes.filter((n) => n.id !== noteId);
  notifyListeners();

  try {
    await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Failed to delete note from API:', err);
  }
}

// Config getters & modifiers
export function getConfig(): AppConfig {
  return cachedConfig;
}

export async function updateConfig(newConfig: Partial<AppConfig>): Promise<void> {
  cachedConfig = { ...cachedConfig, ...newConfig };
  notifyListeners();

  try {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cachedConfig),
    });
  } catch (err) {
    console.error('Failed to update config in API:', err);
  }
}

// Seed Reset
export function resetToDefaults(): void {
  cachedSubjects = DEFAULT_SUBJECTS;
  cachedLessons = DEFAULT_LESSONS;
  cachedNotes = DEFAULT_NOTES;
  cachedConfig = DEFAULT_CONFIG;
  notifyListeners();
}
