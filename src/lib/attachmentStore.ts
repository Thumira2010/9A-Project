import { NoteAttachment, RevisionNote } from '../types';

export async function saveAttachmentToDB(id: string, data: string, name: string, type: string): Promise<void> {
  if (!id || !data) return;
  try {
    await fetch('/api/attachments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, data, name, type }),
    });
  } catch (err) {
    console.warn('API saveAttachment error:', err);
  }
}

export async function getAttachmentFromDB(id: string): Promise<string | null> {
  if (!id) return null;
  try {
    const res = await fetch(`/api/attachments/${id}`);
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('API getAttachment error:', err);
  }
  return null;
}

export async function uploadFileToServer(file: File): Promise<{ id: string; url: string; name: string; type: 'image' | 'pdf' }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    throw new Error('Failed to upload file to server');
  }
  const data = await res.json();
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  return {
    id: data.id,
    url: data.url,
    name: data.filename,
    type: isPdf ? 'pdf' : 'image',
  };
}

export async function saveNoteAttachmentsToDB(note: RevisionNote): Promise<void> {
  if (note.attachments && note.attachments.length > 0) {
    for (const att of note.attachments) {
      if (att.id && att.data) {
        await saveAttachmentToDB(att.id, att.data, att.name, att.type);
      }
    }
  }
}
