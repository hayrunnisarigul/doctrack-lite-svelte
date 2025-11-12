<script>
  export let active = 'docs'; // 'docs' | 'stats' | 'users'
</script>

<nav class="side" aria-label="Yönetim menüsü">
  <ul>
    <li class:active={active==='docs'}>
      <button type="button" class="navlink" on:click={() => active='docs'}>Belgeler</button>
    </li>
    <li class:active={active==='stats'}>
      <button type="button" class="navlink" on:click={() => active='stats'}>Sistem / İstatistik</button>
    </li>
    <li class:active={active==='users'}>
      <button type="button" class="navlink" on:click={() => active='users'}>Kullanıcı İşlemleri</button>
    </li>
  </ul>
</nav>

<style>
  .side{ min-width:230px; border-right:1px solid #2a2a2a; padding:.8rem; position:sticky; top:0; height:100dvh; }
  ul{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.25rem; }
  .navlink{ display:block; width:100%; text-align:left; padding:.55rem .7rem; border-radius:.6rem; color:#ddd; background:transparent; border:1px solid transparent; cursor:pointer; }
  li.active .navlink{ background:#1f1f1f; border-color:#2a2a2a; color:#fff; }
  .navlink:hover{ background:#1a1a1a; }
  @media (max-width:900px){ .side{ position:static; height:auto; min-width:auto; border-right:none; border-bottom:1px solid #2a2a2a; } ul{ flex-direction:row; flex-wrap:wrap; } }
</style>
