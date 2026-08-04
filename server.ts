import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { getDb } from './src/db';
import * as schema from './src/db/schema';
import { eq, asc, desc } from 'drizzle-orm';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists for server-side file storage
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });

// In-memory fallback state if PostgreSQL is not provisioned in dev environment
const memoryStore = {
  subjects: [
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
  ] as any[],
  lessons: [
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
  ] as any[],
  notes: [
    {
      id: 'note-1',
      author_name: 'Kamal Perera',
      subject_id: 'sub-science',
      subject_name: 'Science',
      lesson_id: 'les-sci11-3',
      lesson_name: '3. Newton Laws of Motion & Momentum',
      grade: '11',
      title: 'Newton 3 Laws of Motion Quick Revision Sheet',
      content: `<h2>Summary of Newton's Laws</h2><p>A quick, exam-oriented summary for G.C.E. O/L Physics questions.</p><h3>1. First Law (Law of Inertia)</h3><p>An object remains in its state of rest or uniform motion in a straight line unless acted upon by an external unbalanced force.</p>`,
      helpful_count: 34,
      helpful_voters: [] as string[],
      status: 'Approved',
      created_at: '2026-07-20T10:30:00.000Z',
      attachments: [] as any[],
    },
  ] as any[],
  config: {
    exam_date: '2026-12-08T00:00:00.000Z',
    exam_title: 'G.C.E. O/L Examination 2026/2027',
  },
  adminAuthTokens: new Set<string>(),
  attachments: new Map<string, string>(), // id -> data URL or server path
};

// Admin Session State
let isAdminSessionActive = false;

// Auto-create database tables if connected & seed initial data if empty
async function autoMigrate() {
  const db = getDb();
  if (!db) return;
  try {
    const { pool } = await import('./src/db');
    if (pool) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS subjects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          available_grades TEXT NOT NULL,
          icon_name TEXT
        );
        CREATE TABLE IF NOT EXISTS lessons (
          id TEXT PRIMARY KEY,
          subject_id TEXT NOT NULL,
          grade TEXT NOT NULL,
          lesson_name TEXT NOT NULL,
          lesson_order INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          author_name TEXT NOT NULL,
          subject_id TEXT NOT NULL,
          subject_name TEXT NOT NULL,
          lesson_id TEXT NOT NULL,
          lesson_name TEXT NOT NULL,
          grade TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          helpful_count INTEGER DEFAULT 0 NOT NULL,
          status TEXT DEFAULT 'Pending' NOT NULL,
          rejection_reason TEXT,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS note_attachments (
          id TEXT PRIMARY KEY,
          note_id TEXT NOT NULL,
          type TEXT NOT NULL,
          name TEXT NOT NULL,
          data TEXT,
          file_path TEXT
        );
        CREATE TABLE IF NOT EXISTS note_votes (
          note_id TEXT NOT NULL,
          voter_token TEXT NOT NULL,
          PRIMARY KEY (note_id, voter_token)
        );
        CREATE TABLE IF NOT EXISTS app_config (
          id TEXT PRIMARY KEY DEFAULT 'main',
          exam_date TEXT NOT NULL,
          exam_title TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS admin_users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL
        );
      `);
      console.log('PostgreSQL database tables initialized successfully.');

      // Seed subjects if empty
      const subCheck = await pool.query('SELECT COUNT(*) FROM subjects');
      if (parseInt(subCheck.rows[0].count, 10) === 0) {
        console.log('Seeding initial subjects into PostgreSQL...');
        for (const sub of memoryStore.subjects) {
          await pool.query(
            'INSERT INTO subjects (id, name, category, available_grades, icon_name) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
            [sub.id, sub.name, sub.category, sub.available_grades, sub.icon_name]
          );
        }
      }

      // Seed lessons if empty
      const lesCheck = await pool.query('SELECT COUNT(*) FROM lessons');
      if (parseInt(lesCheck.rows[0].count, 10) === 0) {
        console.log('Seeding initial lessons into PostgreSQL...');
        for (const les of memoryStore.lessons) {
          await pool.query(
            'INSERT INTO lessons (id, subject_id, grade, lesson_name, lesson_order) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
            [les.id, les.subject_id, les.grade, les.lesson_name, les.lesson_order]
          );
        }
      }

      // Seed notes if empty
      const noteCheck = await pool.query('SELECT COUNT(*) FROM notes');
      if (parseInt(noteCheck.rows[0].count, 10) === 0) {
        console.log('Seeding sample revision note into PostgreSQL...');
        for (const note of memoryStore.notes) {
          await pool.query(
            'INSERT INTO notes (id, author_name, subject_id, subject_name, lesson_id, lesson_name, grade, title, content, helpful_count, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT DO NOTHING',
            [note.id, note.author_name, note.subject_id, note.subject_name, note.lesson_id, note.lesson_name, note.grade, note.title, note.content, note.helpful_count, note.status, note.created_at]
          );
        }
      }

      // Seed app_config if empty
      const cfgCheck = await pool.query('SELECT COUNT(*) FROM app_config');
      if (parseInt(cfgCheck.rows[0].count, 10) === 0) {
        await pool.query(
          "INSERT INTO app_config (id, exam_date, exam_title) VALUES ('main', $1, $2) ON CONFLICT DO NOTHING",
          [memoryStore.config.exam_date, memoryStore.config.exam_title]
        );
      }
    }
  } catch (err) {
    console.error('Error during database table creation / seeding:', err);
  }
}

// REST API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', dbConnected: !!getDb() });
});

// GET /api/subjects
app.get('/api/subjects', async (req, res) => {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(schema.subjects);
      return res.json(rows.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        available_grades: r.availableGrades,
        icon_name: r.iconName,
      })));
    } catch (e) {
      console.error(e);
    }
  }
  res.json(memoryStore.subjects);
});

// POST /api/subjects
app.post('/api/subjects', async (req, res) => {
  const { id, name, category, available_grades, icon_name } = req.body;
  const db = getDb();
  if (db) {
    try {
      await db.insert(schema.subjects).values({
        id,
        name,
        category,
        availableGrades: available_grades,
        iconName: icon_name,
      }).onConflictDoUpdate({
        target: schema.subjects.id,
        set: { name, category, availableGrades: available_grades, iconName: icon_name },
      });
      return res.json({ success: true });
    } catch (e) {
      console.error(e);
    }
  }
  const idx = memoryStore.subjects.findIndex(s => s.id === id);
  if (idx >= 0) memoryStore.subjects[idx] = req.body;
  else memoryStore.subjects.push(req.body);
  res.json({ success: true });
});

// DELETE /api/subjects/:id
app.delete('/api/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (db) {
    try {
      await db.delete(schema.subjects).where(eq(schema.subjects.id, id));
      await db.delete(schema.lessons).where(eq(schema.lessons.subjectId, id));
      await db.delete(schema.notes).where(eq(schema.notes.subjectId, id));
      return res.json({ success: true });
    } catch (e) {
      console.error(e);
    }
  }
  memoryStore.subjects = memoryStore.subjects.filter(s => s.id !== id);
  memoryStore.lessons = memoryStore.lessons.filter(l => l.subject_id !== id);
  memoryStore.notes = memoryStore.notes.filter(n => n.subject_id !== id);
  res.json({ success: true });
});

// GET /api/lessons
app.get('/api/lessons', async (req, res) => {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(schema.lessons);
      return res.json(rows.map(r => ({
        id: r.id,
        subject_id: r.subjectId,
        grade: r.grade,
        lesson_name: r.lessonName,
        lesson_order: r.lessonOrder,
      })));
    } catch (e) {
      console.error(e);
    }
  }
  res.json(memoryStore.lessons);
});

// POST /api/lessons
app.post('/api/lessons', async (req, res) => {
  const { id, subject_id, grade, lesson_name, lesson_order } = req.body;
  const db = getDb();
  if (db) {
    try {
      await db.insert(schema.lessons).values({
        id,
        subjectId: subject_id,
        grade,
        lessonName: lesson_name,
        lessonOrder: lesson_order,
      }).onConflictDoUpdate({
        target: schema.lessons.id,
        set: { subjectId: subject_id, grade, lessonName: lesson_name, lessonOrder: lesson_order },
      });
      return res.json({ success: true });
    } catch (e) {
      console.error(e);
    }
  }
  const idx = memoryStore.lessons.findIndex(l => l.id === id);
  if (idx >= 0) memoryStore.lessons[idx] = req.body;
  else memoryStore.lessons.push(req.body);
  res.json({ success: true });
});

// PUT /api/lessons/reorder
app.put('/api/lessons/reorder', async (req, res) => {
  const updatedLessons: any[] = req.body;
  const db = getDb();
  if (db) {
    try {
      for (const les of updatedLessons) {
        await db.update(schema.lessons)
          .set({ lessonOrder: les.lesson_order })
          .where(eq(schema.lessons.id, les.id));
      }
      return res.json({ success: true });
    } catch (e) {
      console.error(e);
    }
  }
  const map = new Map(updatedLessons.map(l => [l.id, l]));
  memoryStore.lessons = memoryStore.lessons.map(l => map.get(l.id) || l);
  res.json({ success: true });
});

// DELETE /api/lessons/:id
app.delete('/api/lessons/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (db) {
    try {
      await db.delete(schema.lessons).where(eq(schema.lessons.id, id));
      await db.delete(schema.notes).where(eq(schema.notes.lessonId, id));
      return res.json({ success: true });
    } catch (e) {
      console.error(e);
    }
  }
  memoryStore.lessons = memoryStore.lessons.filter(l => l.id !== id);
  memoryStore.notes = memoryStore.notes.filter(n => n.lesson_id !== id);
  res.json({ success: true });
});

// GET /api/notes
app.get('/api/notes', async (req, res) => {
  const db = getDb();
  if (db) {
    try {
      const noteRows = await db.select().from(schema.notes);
      const attRows = await db.select().from(schema.noteAttachments);
      const voteRows = await db.select().from(schema.noteVotes);

      const attMap = new Map<string, any[]>();
      for (const att of attRows) {
        if (!attMap.has(att.noteId)) attMap.set(att.noteId, []);
        attMap.get(att.noteId)!.push({
          id: att.id,
          type: att.type,
          name: att.name,
          data: att.data || (att.filePath ? `/uploads/${path.basename(att.filePath)}` : ''),
        });
      }

      const voteMap = new Map<string, string[]>();
      for (const v of voteRows) {
        if (!voteMap.has(v.noteId)) voteMap.set(v.noteId, []);
        voteMap.get(v.noteId)!.push(v.voterToken);
      }

      const result = noteRows.map(n => ({
        id: n.id,
        author_name: n.authorName,
        subject_id: n.subjectId,
        subject_name: n.subjectName,
        lesson_id: n.lessonId,
        lesson_name: n.lessonName,
        grade: n.grade as any,
        title: n.title,
        content: n.content,
        helpful_count: n.helpfulCount,
        helpful_voters: voteMap.get(n.id) || [],
        status: n.status as any,
        rejection_reason: n.rejectionReason || undefined,
        created_at: n.createdAt,
        attachments: attMap.get(n.id) || [],
      }));
      return res.json(result);
    } catch (e) {
      console.error(e);
    }
  }
  res.json(memoryStore.notes);
});

// POST /api/notes
app.post('/api/notes', async (req, res) => {
  const note = req.body;
  const db = getDb();
  if (db) {
    try {
      await db.insert(schema.notes).values({
        id: note.id,
        authorName: note.author_name,
        subjectId: note.subject_id,
        subjectName: note.subject_name,
        lessonId: note.lesson_id,
        lessonName: note.lesson_name,
        grade: note.grade,
        title: note.title,
        content: note.content,
        helpfulCount: note.helpful_count || 0,
        status: note.status || 'Pending',
        rejectionReason: note.rejection_reason || null,
        createdAt: note.created_at,
      }).onConflictDoUpdate({
        target: schema.notes.id,
        set: {
          authorName: note.author_name,
          title: note.title,
          content: note.content,
          helpfulCount: note.helpful_count,
          status: note.status,
          rejectionReason: note.rejection_reason,
        },
      });

      if (note.attachments && note.attachments.length > 0) {
        for (const att of note.attachments) {
          await db.insert(schema.noteAttachments).values({
            id: att.id,
            noteId: note.id,
            type: att.type,
            name: att.name,
            data: att.data,
          }).onConflictDoUpdate({
            target: schema.noteAttachments.id,
            set: { data: att.data, name: att.name },
          });
        }
      }
      return res.json({ success: true });
    } catch (e) {
      console.error(e);
    }
  }

  const idx = memoryStore.notes.findIndex(n => n.id === note.id);
  if (idx >= 0) memoryStore.notes[idx] = note;
  else memoryStore.notes.unshift(note);
  res.json({ success: true });
});

// PUT /api/notes/:id/status
app.put('/api/notes/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, rejection_reason } = req.body;
  const db = getDb();
  if (db) {
    try {
      await db.update(schema.notes)
        .set({ status, rejectionReason: rejection_reason || null })
        .where(eq(schema.notes.id, id));
      return res.json({ success: true });
    } catch (e) {
      console.error(e);
    }
  }

  const note = memoryStore.notes.find(n => n.id === id);
  if (note) {
    note.status = status;
    if (rejection_reason) note.rejection_reason = rejection_reason;
  }
  res.json({ success: true });
});

// POST /api/notes/:id/vote
app.post('/api/notes/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { voter_token } = req.body;
  const db = getDb();
  if (db) {
    try {
      const existing = await db.select()
        .from(schema.noteVotes)
        .where(eq(schema.noteVotes.noteId, id));

      const hasVoted = existing.some(v => v.voterToken === voter_token);
      let newCount = 0;

      if (hasVoted) {
        await db.delete(schema.noteVotes)
          .where(eq(schema.noteVotes.noteId, id));
        const [updatedNote] = await db.select().from(schema.notes).where(eq(schema.notes.id, id));
        newCount = Math.max(0, (updatedNote?.helpfulCount || 1) - 1);
        await db.update(schema.notes).set({ helpfulCount: newCount }).where(eq(schema.notes.id, id));
      } else {
        await db.insert(schema.noteVotes).values({ noteId: id, voterToken: voter_token });
        const [updatedNote] = await db.select().from(schema.notes).where(eq(schema.notes.id, id));
        newCount = (updatedNote?.helpfulCount || 0) + 1;
        await db.update(schema.notes).set({ helpfulCount: newCount }).where(eq(schema.notes.id, id));
      }
      return res.json({ success: true, helpful: !hasVoted, count: newCount });
    } catch (e) {
      console.error(e);
    }
  }

  const note = memoryStore.notes.find(n => n.id === id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  if (!note.helpful_voters) note.helpful_voters = [];
  const alreadyVoted = note.helpful_voters.includes(voter_token);
  if (alreadyVoted) {
    note.helpful_voters = note.helpful_voters.filter((t: string) => t !== voter_token);
    note.helpful_count = Math.max(0, note.helpful_count - 1);
  } else {
    note.helpful_voters.push(voter_token);
    note.helpful_count += 1;
  }
  res.json({ success: true, helpful: !alreadyVoted, count: note.helpful_count });
});

// DELETE /api/notes/:id
app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (db) {
    try {
      await db.delete(schema.notes).where(eq(schema.notes.id, id));
      await db.delete(schema.noteAttachments).where(eq(schema.noteAttachments.noteId, id));
      await db.delete(schema.noteVotes).where(eq(schema.noteVotes.noteId, id));
      return res.json({ success: true });
    } catch (e) {
      console.error(e);
    }
  }
  memoryStore.notes = memoryStore.notes.filter(n => n.id !== id);
  res.json({ success: true });
});

// Server-side File Upload Endpoint (Upload images & PDFs directly to server storage)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    url: fileUrl,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
});

// GET /api/attachments/:id
app.get('/api/attachments/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (db) {
    try {
      const [att] = await db.select().from(schema.noteAttachments).where(eq(schema.noteAttachments.id, id));
      if (att && att.data) {
        return res.json({ data: att.data });
      }
    } catch (e) {
      console.error(e);
    }
  }
  const data = memoryStore.attachments.get(id);
  res.json({ data: data || null });
});

// POST /api/attachments
app.post('/api/attachments', async (req, res) => {
  const { id, data, name, type } = req.body;
  const db = getDb();
  if (db && id && data) {
    try {
      await db.insert(schema.noteAttachments).values({
        id,
        noteId: req.body.note_id || 'unassigned',
        type: type || 'image',
        name: name || 'Attachment',
        data,
      }).onConflictDoUpdate({
        target: schema.noteAttachments.id,
        set: { data, name, type },
      });
      return res.json({ success: true });
    } catch (e) {
      console.error(e);
    }
  }
  if (id && data) {
    memoryStore.attachments.set(id, data);
  }
  res.json({ success: true });
});

// GET /api/config
app.get('/api/config', async (req, res) => {
  const db = getDb();
  if (db) {
    try {
      const [cfg] = await db.select().from(schema.appConfig).where(eq(schema.appConfig.id, 'main'));
      if (cfg) {
        return res.json({ exam_date: cfg.examDate, exam_title: cfg.examTitle });
      }
    } catch (e) {
      console.error(e);
    }
  }
  res.json(memoryStore.config);
});

// POST /api/config
app.post('/api/config', async (req, res) => {
  const { exam_date, exam_title } = req.body;
  const db = getDb();
  if (db) {
    try {
      await db.insert(schema.appConfig).values({
        id: 'main',
        examDate: exam_date,
        examTitle: exam_title,
      }).onConflictDoUpdate({
        target: schema.appConfig.id,
        set: { examDate: exam_date, examTitle: exam_title },
      });
      return res.json({ success: true });
    } catch (e) {
      console.error(e);
    }
  }
  if (exam_date) memoryStore.config.exam_date = exam_date;
  if (exam_title) memoryStore.config.exam_title = exam_title;
  res.json({ success: true });
});

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    isAdminSessionActive = true;
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid admin credentials' });
});

// GET /api/admin/check
app.get('/api/admin/check', (req, res) => {
  res.json({ authenticated: isAdminSessionActive });
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  isAdminSessionActive = false;
  res.json({ success: true });
});

async function startServer() {
  await autoMigrate();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
