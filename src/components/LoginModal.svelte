<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { login, signup } from '../lib/stores/auth.js';
  const dispatch = createEventDispatcher();

  let mode = 'login';
  let username = '';
  let password = '';
  let email = '';
  let err = '';
  let userInput;

  const close = () => dispatch('close');
  const onBackdropKey = (e) => { if (e.key === 'Escape') close(); };

  onMount(() => { userInput && userInput.focus(); });

  function doLogin() {
    err = '';
    const r = login(username.trim(), password);
    if (!r.ok) { err = r.msg; return; }
    close();
  }
  function doSignup() {
    err = '';
    if (!username.trim() || !password.trim()) { err = 'Kullanıcı adı ve şifre gerekli'; return; }
    const r = signup(username.trim(), password.trim(), email.trim());
    if (!r.ok) { err = r.msg; return; }
    mode = 'login'; password = '';
    setTimeout(() => userInput && userInput.focus(), 0);
  }
</script>

<div class="backdrop"
     role="presentation"
     tabindex="0"
     aria-label="Giriş penceresi arka planı"
     on:click={close}
     on:keydown={onBackdropKey}>
  <div class="modal"
       role="dialog"
       aria-modal="true"
       aria-label={mode === 'login' ? 'Giriş' : 'Kayıt ol'}
       tabindex="0"
       on:keydown={(e)=>{ if(e.key==='Escape') close(); }}
       on:click|stopPropagation>

    <!-- Sağ üstte çarpı -->
    <button class="close-btn" aria-label="Kapat" on:click={close}>✕</button>

    {#if mode === 'login'}
      <h2>Giriş</h2>
      <label>Kullanıcı adı <input bind:this={userInput} bind:value={username}></label>
      <label>Şifre <input type="password" bind:value={password}></label>
      {#if err}<p class="err">{err}</p>{/if}
      <div class="row">
        <button class="btn" on:click={doLogin}>Giriş yap</button>
      </div>
      <p class="hint">Hesabın yok mu?
        <button type="button" class="linklike" on:click={() => (mode='signup', err='')}>Kayıt ol</button>
      </p>
    {:else}
      <h2>Kayıt Ol</h2>
      <label>Kullanıcı adı <input bind:this={userInput} bind:value={username}></label>
      <label>E-posta <input type="email" bind:value={email}></label>
      <label>Şifre <input type="password" bind:value={password}></label>
      {#if err}<p class="err">{err}</p>{/if}
      <div class="row">
        <button class="btn" on:click={doSignup}>Kaydı oluştur</button>
        <button class="btn ghost" on:click={() => (mode='login', err='')}>Geri</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: #0008;
    display: grid;
    place-items: center;
  }
  .modal {
    width: min(460px, 92vw);
    background: #141414;
    color: #fff;
    border: 1px solid #2a2a2a;
    border-radius: .8rem;
    padding: 1.5rem 1rem;
    position: relative;
  }
  .close-btn {
    position: absolute;
    top: .6rem;
    right: .6rem;
    border: none;
    background: transparent;
    color: #bbb;
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
  }
  .close-btn:hover {
    color: #fff;
  }
  label { display: block; margin: .6rem 0; }
  input {
    width: 100%;
    padding: .5rem .6rem;
    border: 1px solid #333;
    border-radius: .5rem;
    background: #1a1a1a;
    color: #fff;
  }
  .row { display: flex; gap: .5rem; margin-top: .6rem; flex-wrap: wrap; }
  .btn {
    padding: .55rem .9rem;
    border: 1px solid #3b3b3b;
    border-radius: .6rem;
    background: #222;
    color: #fff;
    cursor: pointer;
  }
  .btn.ghost { background: transparent; }
  .err { color: #ff7a7a; }
  .hint { opacity: .8; margin-top: .4rem; }
  .linklike {
    background: none;
    border: none;
    color: #82b1ff;
    text-decoration: underline;
    cursor: pointer;
    padding: 0 .15rem;
  }
  .linklike:hover { text-decoration: none; }
</style>
