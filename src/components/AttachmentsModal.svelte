<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { listFiles, deleteFile, downloadFile, addFiles } from '../lib/db/files';

  export let docId;
  const dispatch = createEventDispatcher();

  let files = [];
  let picker;   // <input type="file"> ref
  let err = '';

  async function load(){ files = await listFiles(docId); }
  onMount(load);

  async function onAdd(e){
    err = '';
    try {
      const sel = e.currentTarget.files;
      await addFiles(docId, sel);
      await load();
      e.currentTarget.value = '';
    } catch (ex) {
      err = String(ex);
    }
  }
  async function onDel(id){ await deleteFile(id); await load(); }
  const onDown = (id) => downloadFile(id);
</script>

<div class="backdrop" role="presentation" tabindex="0"
     on:click={() => dispatch('close')}
     on:keydown={(e)=>{ if(e.key==='Escape') dispatch('close'); }}>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Ekler" tabindex="0"
       on:click|stopPropagation
       on:keydown={(e)=>{ if(e.key==='Escape') dispatch('close'); }}>
    <h2>Ekler</h2>
    <div class="row">
      <input bind:this={picker} type="file" multiple on:change={onAdd} />
      <button class="btn ghost" on:click={() => picker && picker.click()}>Dosya Seç</button>
      <button class="btn" on:click={() => dispatch('close')}>Kapat</button>
    </div>
    {#if err}<p class="err">{err}</p>{/if}

    <table class="tbl">
      <thead><tr><th>Ad</th><th>Boyut</th><th>İşlem</th></tr></thead>
      <tbody>
        {#each files as f}
          <tr>
            <td>{f.name}</td>
            <td>{(f.size/1024).toFixed(1)} KB</td>
            <td class="btns">
              <button class="btn sm" on:click={() => onDown(f.id)}>İndir</button>
              <button class="btn sm danger" on:click={() => onDel(f.id)}>Sil</button>
            </td>
          </tr>
        {/each}
        {#if !files.length}<tr><td colspan="3">Henüz ek yok.</td></tr>{/if}
      </tbody>
    </table>
  </div>
</div>

<style>
  .backdrop{ position:fixed; inset:0; background:#0008; display:grid; place-items:center; }
  .modal{ width:min(720px,94vw); background:#141414; color:#fff;
    border:1px solid #2a2a2a; border-radius:.8rem; padding:1rem; }
  .row{ display:flex; gap:.5rem; margin:.5rem 0; align-items:center; flex-wrap:wrap; }
  .btn{ padding:.55rem .9rem; border:1px solid #3b3b3b; border-radius:.6rem; background:#222; color:#fff; cursor:pointer; }
  .btn.ghost{ background:transparent; } .btn.sm{ padding:.35rem .6rem; font-size:.9rem; }
  .btn.danger{ border-color:#703; }
  .tbl{ width:100%; border-collapse:collapse; border:1px solid #2a2a2a; margin-top:.5rem; }
  .tbl th, .tbl td{ border:1px solid #2a2a2a; padding:.5rem .6rem; text-align:left; }
  .tbl th{ background:#151515; }
  .btns{ display:flex; gap:.4rem; }
  .err{ color:#ff7a7a; }
</style>
