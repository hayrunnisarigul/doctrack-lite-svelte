<script>
  import { onMount } from 'svelte';
  import { db } from './lib/db/dexie.js';

  import LoginModal from './components/LoginModal.svelte';
  import SettingsModal from './components/SettingsModal.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import AdminStats from './components/AdminStats.svelte';
  import AdminUsers from './components/AdminUsers.svelte';
  import AttachmentsModal from './components/AttachmentsModal.svelte';

  import { user, isAuthed, perms, logout } from './lib/stores/auth.js';
  import { get } from 'svelte/store';
  import { downloadCSV, downloadJSON } from './lib/utils/export.js';
  import { addFiles, deleteAllFilesOfDoc } from './lib/db/files';

  let section = 'docs'; // admin: 'docs'|'stats'|'users'
  let rows = [];
  let formOpen = false;
  let loginOpen = false;
  let settingsOpen = false;

  // Ekler modalı
  let attachmentsOpen = false;
  let attachmentsDocId = null;

  // filtreler
  let q = ''; let fGonderen=''; let fAlan=''; let fDurum='';

  // form & dosya seçimi
  let attachPicker;
  let pendingFiles = []; // File[]

  let rec = emptyRec();
  function emptyRec(){
    return {
      owner:'', gonderen:'', alan:'', konu:'',
      tarih:new Date().toISOString().slice(0,10), durum:'beklemede',
      etiketler:[], dosyaNo:'', aciklama:'', createdAt:Date.now(), updatedAt:Date.now()
    };
  }

  async function load(){ rows = await db.documents.orderBy('tarih').reverse().toArray(); }
  onMount(load);

  async function save(){
    const $u = get(user);
    rec.owner = $u.username || '';
    rec.updatedAt = Date.now();

    let id = rec.id;
    if (id) {
      if (!get(perms).canEditDoc) return;
      await db.documents.update(rec.id, rec);
      id = rec.id;
    } else {
      if (!get(perms).canCreateDoc) return;
      id = await db.documents.add(rec);
    }

    // seçili dosyaları belgeye ekle
    if (pendingFiles.length) {
      await addFiles(id, pendingFiles);
      pendingFiles = [];
      if (attachPicker) attachPicker.value = '';
    }

    formOpen=false; rec=emptyRec(); await load();
  }
  function edit(r){ if (!get(perms).canEditDoc) return; rec=structuredClone(r); formOpen=true; }
  async function del(id){
    if (!get(perms).canDeleteDoc) return;
    await db.documents.delete(id);
    await deleteAllFilesOfDoc(id); // belge silinince ekleri de sil
    await load();
  }

  $: displayed = rows.filter(r => {
    const okQ = q ? (r.konu+' '+r.gonderen+' '+r.alan).toLowerCase().includes(q.toLowerCase()) : true;
    const okG = fGonderen ? r.gonderen.toLowerCase().includes(fGonderen.toLowerCase()) : true;
    const okA = fAlan ? r.alan.toLowerCase().includes(fAlan.toLowerCase()) : true;
    const okD = fDurum ? r.durum === fDurum : true;
    return okQ && okG && okA && okD;
  });

  const exportCSV = () => downloadCSV('belgeler.csv', displayed);
  const exportJSON = () => downloadJSON('belgeler.json', displayed);
</script>

<main class={$perms.role==='admin' ? 'layout' : ''}>
  {#if $perms.role==='admin'}
    <Sidebar bind:active={section} />
  {/if}

  <div class="content">
    <header class="topbar">
      <h1>DocTrack Lite</h1>
      <div class="actions">
        {#if $isAuthed}
          <span class="pill">{$user.username} ({$perms.role})</span>

          {#if section==='docs' || $perms.role!=='admin'}
            <button class="btn ghost" on:click={() => (formOpen=true)} disabled={!$perms.canCreateDoc}>Yeni</button>
            {#if $perms.role==='admin'}
              <button class="btn ghost" on:click={exportCSV}>CSV</button>
              <button class="btn ghost" on:click={exportJSON}>JSON</button>
            {/if}
          {/if}

          {#if $perms.role!=='admin'}
            <button class="btn" on:click={() => (settingsOpen=true)}>Ayarlar</button>
          {/if}
          <button class="btn" on:click={logout}>Çıkış</button>
        {:else}
          <button class="btn" on:click={() => (loginOpen=true)}>Giriş</button>
        {/if}
      </div>
    </header>

    {#if section==='docs' || $perms.role!=='admin'}
      <section class="panel">
        <div class="grid4">
          <label>Genel arama <input placeholder="konu / gönderen / alan" bind:value={q}></label>
          <label>Gönderen <input bind:value={fGonderen}></label>
          <label>Alan <input bind:value={fAlan}></label>
          <label>Durum
            <select bind:value={fDurum}>
              <option value="">(hepsi)</option>
              <option value="beklemede">Beklemede</option>
              <option value="gonderildi">Gönderildi</option>
              <option value="alindi">Alındı</option>
            </select>
          </label>
        </div>
      </section>

      {#if formOpen}
        <form on:submit|preventDefault={save} class="panel">
          <div class="grid2">
            <label>Gönderen <input bind:value={rec.gonderen} required></label>
            <label>Alan <input bind:value={rec.alan} required></label>
            <label>Konu <input bind:value={rec.konu} required></label>
            <label>Tarih <input type="date" bind:value={rec.tarih} required></label>
            <label>Durum
              <select bind:value={rec.durum}>
                <option value="beklemede">Beklemede</option>
                <option value="gonderildi">Gönderildi</option>
                <option value="alindi">Alındı</option>
              </select>
            </label>
            <label>Dosya No <input bind:value={rec.dosyaNo}></label>

            <label class="full">Etiketler (virgülle)
              <input on:change={(e)=>rec.etiketler=String(e.target.value).split(',').map(s=>s.trim()).filter(Boolean)}>
            </label>

            <label class="full">Açıklama <textarea bind:value={rec.aciklama}></textarea></label>

            <label class="full">Dosya Yükle (çoklu)
              <input bind:this={attachPicker} type="file" multiple
                     on:change={(e)=> pendingFiles = Array.from(e.currentTarget.files)} />
            </label>
            <p class="full" style="opacity:.75;margin:0;">
              {#if pendingFiles.length}{pendingFiles.length} dosya seçildi.{:else}Dosya seçilmedi.{/if}
            </p>
          </div>

          <div class="row">
            <button type="submit" class="btn">Kaydet</button>
            <button type="button" class="btn ghost"
                    on:click={() => (formOpen=false, rec=emptyRec(), pendingFiles=[], attachPicker && (attachPicker.value=''))}>
              Kapat
            </button>
          </div>
        </form>
      {/if}

      <table class="rwd-table">
        <thead><tr>
          <th>Tarih</th><th>Konu</th><th>Gönderen</th><th>Alan</th><th>Durum</th><th>İşlem</th>
        </tr></thead>
        <tbody>
          {#each displayed as r}
            <tr>
              <td data-label="Tarih">{r.tarih}</td>
              <td data-label="Konu">{r.konu}</td>
              <td data-label="Gönderen">{r.gonderen}</td>
              <td data-label="Alan">{r.alan}</td>
              <td data-label="Durum">{r.durum}</td>
              <td data-label="İşlem">
                <div class="btns">
                  <button class="btn sm" on:click={() => { attachmentsDocId = r.id; attachmentsOpen = true; }}>Ekler</button>
                  {#if $perms.canEditDoc}<button class="btn sm" on:click={() => edit(r)}>Düzenle</button>{/if}
                  {#if $perms.canDeleteDoc}<button class="btn sm danger" on:click={() => del(r.id)}>Sil</button>{/if}
                </div>
              </td>
            </tr>
          {/each}
          {#if !displayed.length}<tr><td colspan="6">Kayıt bulunamadı.</td></tr>{/if}
        </tbody>
      </table>
    {/if}

    {#if $perms.role==='admin' && section==='stats'}
      <section class="panel"><AdminStats {rows} /></section>
    {/if}
    {#if $perms.role==='admin' && section==='users'}
      <section class="panel"><AdminUsers /></section>
    {/if}
  </div>
</main>

{#if loginOpen}<LoginModal on:close={() => (loginOpen=false)} />{/if}
{#if settingsOpen}<SettingsModal rows={displayed} on:close={() => (settingsOpen=false)} />{/if}
{#if attachmentsOpen}<AttachmentsModal docId={attachmentsDocId} on:close={() => (attachmentsOpen=false)} />{/if}

<style>
  .layout{ display:grid; grid-template-columns: auto 1fr; }
  @media (max-width: 900px){ .layout{ grid-template-columns: 1fr; } }
  .content{ min-width: 0; }

  .topbar{ display:flex; align-items:center; justify-content:space-between; padding:.9rem 1rem; border-bottom:1px solid #2a2a2a; }
  h1{ font-size: clamp(1.2rem, 2.2vw, 2rem); margin:0; }
  .actions{ display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; }
  .pill{ padding:.35rem .6rem; border:1px solid #3b3b3b; border-radius:999px; background:#1b1b1b; }
  .btn{ padding:.55rem .9rem; border:1px solid #3b3b3b; border-radius:.6rem; background:#222; color:#fff; cursor:pointer; }
  .btn:hover{ background:#2a2a2a; }
  .btn.ghost{ background:transparent; }
  .btn.sm{ padding:.35rem .6rem; font-size:.9rem; }
  .btn.danger{ border-color:#703; }
  .btns{ display:flex; gap:.4rem; }

  .panel{ border:1px solid #2a2a2a; border-radius:.8rem; padding:1rem; margin:1rem; background:#141414; }

  .grid2{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:.8rem; }
  .grid2 .full{ grid-column:1/-1; }
  .grid4{ display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:.8rem; }
  @media (max-width:900px){ .grid4{ grid-template-columns: repeat(2,1fr);} }
  @media (max-width:540px){ .grid2, .grid4{ grid-template-columns:1fr;} }

  input,select,textarea{ width:100%; padding:.5rem .6rem; border:1px solid #333; border-radius:.5rem; background:#1a1a1a; color:#fff; }
  textarea{ min-height:90px; }
  .row{ display:flex; gap:.5rem; margin-top:.6rem; }

  /* responsive tablo */
  .rwd-table{ width:100%; border-collapse:collapse; border:1px solid #2a2a2a; }
  .rwd-table th,.rwd-table td{ border:1px solid #2a2a2a; padding:.6rem .7rem; text-align:left; }
  .rwd-table th{ background:#151515; position:sticky; top:0; }
  @media (max-width:700px){
    .rwd-table thead{ display:none; }
    .rwd-table tr{ display:block; border:1px solid #2a2a2a; margin:.6rem 0; border-radius:.6rem; overflow:hidden; }
    .rwd-table td{ display:flex; justify-content:space-between; gap:1rem; border:none; border-bottom:1px solid #2a2a2a; }
    .rwd-table td:last-child{ border-bottom:none; }
    .rwd-table td::before{ content: attr(data-label); font-weight:600; opacity:.8; }
  }
</style>
