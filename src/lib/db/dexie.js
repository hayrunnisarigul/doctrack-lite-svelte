import Dexie from 'dexie';

export const db = new Dexie('doctrack-lite');

// v3: files tablosu eklendi
db.version(3).stores({
  documents: '++id, owner, tarih, durum, gonderen, alan, *etiketler',
  files: '++id, docId' // blob + meta
});
