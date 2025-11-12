<script>
  import { createEventDispatcher } from 'svelte';
  import { user, updateOwnProfile, logout } from '../lib/stores/auth.js';
  import { get } from 'svelte/store';
  import { downloadCSV, downloadJSON } from '../lib/utils/export.js';

  export let rows = [];
  const dispatch = createEventDispatcher();

  let tab = 'profile';
  let newUsername = get(user).username;
  let newEmail = get(user).email || '';
  let newPassword = '';
  let msg='', ok=false;

  const close = () => dispatch('close');
  const onBackdropKey = (e) => { if(e.key==='Escape'){ close(); } };

  function save(){
    msg=''; ok=false;
    const r = updateOwnProfile({ newUsername, newPassword, newEmail });
    if(!r.ok){ msg=r.msg; return; }
    ok=true; newPassword='';
  }
  const doExportCSV = () => downloadCSV('belgeler.csv', rows);
  const doExportJSON = () => downloadJSON('belgeler.json', rows);
</script>

<div class="backdrop"
     role="presentation"
     tabindex="0"
     aria-label="Ayarlar penceresi arka planı"
     on:click={close}
     on:keydown={onBackdropKey}>
  <div class="modal"
       role="dialog"
       aria-modal="true"
       aria-label="Ayarlar"
       tabindex="0"
       on:keydown={(e)=>{ if(e.key==='Escape') close(); }}
       on:click|stopPropagation>

    <div class="tabs" role="tablist" aria-label="Ayarlar sekmeleri">
      <button role="tab" aria-selected={tab==='profile'} class:active={tab==='profile'} on:click={() => tab='profile'}>Profil</button>
      <button role="tab" aria-selected={tab==='export'}  class:active={tab==='export'}  on:click={() => tab='export'}>Dışa Aktar</button>
    </div>

    {#if tab==='profile'}
      <h2>Profilim</h2>
      <label>Kullanıcı adı <input bind:value={newUsername}></label>
      <label>E-posta <input type="email" bind:value={newEmail}></label>
      <label>Yeni şifre <input type="password" bind:value={newPassword} placeholder="(boş → değişmez)"></label>
      {#if msg}<p class="err">{msg}</p>{/if}
      {#if ok}<p class="ok">Güncellendi.</p>{/if}
      <div class="row">
        <button class="btn" on:click={save}>Kaydet</button>
        <button class="btn ghost" on:click={close}>Kapat</button>
        <button class="btn danger" on:click={logout}>Çıkış</button>
      </div>
    {:else}
      <h2>Dışa Aktar</h2>
      <div class="row">
        <button class="btn" on:click={doExportCSV}>CSV (Excel)</button>
        <button class="btn ghost" on:click={doExportJSON}>JSON</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .backdrop{ position:fixed; inset:0; background:#0008; display:grid; place-items:center; }
  .modal{ width:min(520px,92vw); background:#141414; color:#fff; border:1px solid #2a2a2a; border-radius:.8rem; padding:1rem; }
  .tabs{ display:flex; gap:.4rem; margin-bottom:.6rem; }
  .tabs button{ flex:1; padding:.5rem; border:1px solid #333; background:#1a1a1a; color:#fff; border-radius:.5rem; cursor:pointer; }
  .tabs button.active{ background:#222; }
  label{ display:block; margin:.6rem 0; }
  input{ width:100%; padding:.5rem .6rem; border:1px solid #333; border-radius:.5rem; background:#1a1a1a; color:#fff; }
  .row{ display:flex; gap:.5rem; margin-top:.6rem; flex-wrap:wrap; }
  .btn{ padding:.55rem .9rem; border:1px solid #3b3b3b; border-radius:.6rem; background:#222; color:#fff; cursor:pointer; }
  .btn.ghost{ background:transparent; }
  .btn.danger{ border-color:#703; }
  .err{ color:#ff7a7a; } .ok{ color:#9f9; }
</style>
