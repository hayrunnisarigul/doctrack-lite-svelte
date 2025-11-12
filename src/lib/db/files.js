import { db } from './dexie';

// FileList veya File[] -> ekle
export async function addFiles(docId, fileListOrArray) {
  const arr = Array.from(fileListOrArray || []);
  if (!arr.length) return [];
  const rows = arr.map(f => ({
    docId,
    name: f.name,
    type: f.type,
    size: f.size,
    blob: f
  }));
  return db.files.bulkAdd(rows, { allKeys: true });
}

export function listFiles(docId) {
  return db.files.where('docId').equals(docId).toArray();
}

export async function deleteFile(fileId) {
  await db.files.delete(fileId);
}

export async function deleteAllFilesOfDoc(docId) {
  await db.files.where('docId').equals(docId).delete();
}

export async function downloadFile(fileId) {
  const f = await db.files.get(fileId);
  if (!f) return;
  const url = URL.createObjectURL(f.blob);
  const a = document.createElement('a');
  a.href = url; a.download = f.name || 'dosya';
  a.click();
  URL.revokeObjectURL(url);
}
