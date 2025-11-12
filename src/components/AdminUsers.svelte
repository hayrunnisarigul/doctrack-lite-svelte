<script>
  import { listUsers, adminCreateUser, adminDeleteUser, adminSetRole, perms } from '../lib/stores/auth.js';
  import { get } from 'svelte/store';

  let users = [];
  let form = { username:'', email:'', password:'', role:'user' };
  let msg = '';

  function load(){ users = listUsers(); }
  load();

  function add(){
    msg=''; if (!get(perms).canManageUsers) { msg='İzin yok'; return; }
    const r = adminCreateUser(form.username.trim(), form.password, form.role, form.email.trim());
    if (!r.ok) { msg=r.msg; return; }
    form = { username:'', email:'', password:'', role:'user' };
    load();
  }
  function del(name){
    msg=''; if (!get(perms).canManageUsers) { msg='İzin yok'; return; }
    const r = adminDeleteUser(name); if (!r.ok){ msg=r.msg; return; } load();
  }
  function setRole(name, role){
    msg=''; if (!get(perms).canManageUsers) { msg='İzin yok'; return; }
    const r = adminSetRole(name, role); if (!r.ok){ msg=r.msg; return; } load();
  }
</script>

<h2>Kullanıcı İşlemleri</h2>

<div class="panel">
  <div class="grid4">
    <label>Kullanıcı adı <input bind:value={form.username}></label>
    <label>E-posta <input type="email" bind:value={form.email}></label>
    <label>Şifre <input type="password" bind:value={form.password}></label>
    <label>Rol
      <select bind:value={form.role}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
    </label>
  </div>
  <div class="row"><button class="btn" on:click={add}>Yeni Kullanıcı Ekle</button></div>
  {#if msg}<p class="err">{msg}</p>{/if}
</div>

<table class="tbl">
  <thead><tr><th>Kullanıcı</th><th>E-posta</th><th>Rol</th><th>İşlem</th></tr></thead>
  <tbody>
    {#each users as u}
      <tr>
        <td>{u.username}</td>
        <td>{u.email}</td>
        <td>
          <select value={u.role} on:change={(e)=>setRole(u.username, e.target.value)}>
            <option value="user"  selected={u.role==='user'}>user</option>
            <option value="admin" selected={u.role==='admin'}>admin</option>
          </select>
        </td>
        <td><button class="btn sm danger" on:click={()=>del(u.username)}>Sil</button></td>
      </tr>
    {/each}
    {#if !users.length}<tr><td colspan="4">Kullanıcı yok</td></tr>{/if}
  </tbody>
</table>

<style>
  .panel{ border:1px solid #2a2a2a; border-radius:.8rem; padding:1rem; background:#141414; margin:.8rem 0; }
  .grid4{ display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:.8rem; }
  @media (max-width: 900px){ .grid4{ grid-template-columns: repeat(2,1fr);} }
  @media (max-width: 540px){ .grid4{ grid-template-columns: 1fr;} }
  .row{ margin-top:.6rem; }
  .btn{ padding:.55rem .9rem; border:1px solid #3b3b3b; border-radius:.6rem; background:#222; color:#fff; cursor:pointer; }
  .btn.sm{ padding:.35rem .6rem; font-size:.9rem; }
  .btn.danger{ border-color:#703; }
  .tbl{ width:100%; border-collapse:collapse; border:1px solid #2a2a2a; }
  .tbl th,.tbl td{ border:1px solid #2a2a2a; padding:.5rem .6rem; text-align:left; }
  .tbl th{ background:#151515; }
  input,select{ width:100%; padding:.5rem .6rem; border:1px solid #333; border-radius:.5rem; background:#1a1a1a; color:#fff; }
  .err{ color:#ff7a7a; }
</style>
