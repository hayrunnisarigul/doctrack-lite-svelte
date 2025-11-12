<script>
  import { user, updateOwnProfile } from '../lib/stores/auth.js';
  import { get } from 'svelte/store';

  let newUsername = get(user).username;
  let newPassword = '';
  let newEmail    = get(user).email || '';
  let msg = '', ok = false;

  function save() {
    msg = ''; ok = false;
    const r = updateOwnProfile({ newUsername, newPassword, newEmail });
    if (!r.ok) { msg = r.msg; return; }
    ok = true; newPassword = '';
  }
</script>

<h2>Profil Ayarları</h2>
<div class="grid">
  <label>Kullanıcı adı
    <input bind:value={newUsername}>
  </label>
  <label>E-posta
    <input type="email" bind:value={newEmail} placeholder="ornek@posta.com">
  </label>
  <label class="full">Yeni şifre
    <input type="password" bind:value={newPassword} placeholder="(boş bırakırsan değişmez)">
  </label>
</div>
<div class="row">
  <button class="btn" on:click={save}>Kaydet</button>
</div>
{#if msg}<p class="err">{msg}</p>{/if}
{#if ok}<p class="ok">Güncellendi.</p>{/if}

<style>
  h2{ margin:.2rem 0 1rem 0; }
  .grid{ display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:.8rem; }
  .grid .full{ grid-column:1/-1; }
  @media (max-width: 540px){ .grid{ grid-template-columns:1fr; } }
  .row{ margin-top:.6rem; }
  .btn{ padding:.55rem .9rem; border:1px solid #3b3b3b; border-radius:.6rem; background:#222; color:#fff; cursor:pointer; }
  .err{ color:#ff7a7a; }
  .ok{ color:#9f9; }
  input{ width:100%; padding:.5rem .6rem; border:1px solid #333; border-radius:.5rem; background:#1a1a1a; color:#fff; }
</style>
