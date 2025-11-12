<script>
  export let rows = [];

  $: total = rows.length;
  $: byStatus = countBy(rows, 'durum');
  $: byOwner  = countBy(rows, 'owner');

  function countBy(arr, key){
    const m = {}; for (const r of arr){ const k = r[key] || '(boş)'; m[k] = (m[k]||0)+1; }
    return m;
  }
</script>

<h2>Sistem / İstatistik</h2>
<div class="cards">
  <div class="card"><div class="k">Toplam Belge</div><div class="v">{total}</div></div>
  <div class="card"><div class="k">Beklemede</div><div class="v">{byStatus.beklemede || 0}</div></div>
  <div class="card"><div class="k">Gönderildi</div><div class="v">{byStatus.gonderildi || 0}</div></div>
  <div class="card"><div class="k">Alındı</div><div class="v">{byStatus.alindi || 0}</div></div>
</div>

<h3 style="margin-top:1rem">Sahip / Belge sayısı</h3>
<table class="tbl">
  <thead><tr><th>Kullanıcı</th><th>Adet</th></tr></thead>
  <tbody>
    {#each Object.entries(byOwner) as [name, n]}
      <tr><td>{name}</td><td>{n}</td></tr>
    {/each}
    {#if !Object.keys(byOwner).length}<tr><td colspan="2">Kayıt yok</td></tr>{/if}
  </tbody>
</table>

<style>
  .cards{ display:grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap:.8rem; }
  @media (max-width: 800px){ .cards{ grid-template-columns: repeat(2,1fr);} }
  @media (max-width: 520px){ .cards{ grid-template-columns: 1fr;} }
  .card{ border:1px solid #2a2a2a; border-radius:.8rem; padding:1rem; background:#141414; }
  .k{ opacity:.8; } .v{ font-size:1.6rem; font-weight:700; margin-top:.25rem; }
  .tbl{ width:100%; border-collapse:collapse; border:1px solid #2a2a2a; margin-top:.5rem; }
  .tbl th,.tbl td{ border:1px solid #2a2a2a; padding:.5rem .6rem; text-align:left; }
  .tbl th{ background:#151515; }
</style>
