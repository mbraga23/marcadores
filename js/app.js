// ══════════════════════════════════════════════════════════════════════
// Marcador de Consumo Alimentar — App Logic
// ══════════════════════════════════════════════════════════════════════

let registros = [];      // Local cache of all user's avaliacoes
let currentUser = null;  // Current authenticated user

// ── Helpers ───────────────────────────────────────────────────────────

function getMes() {
  const d = new Date();
  return MESES[d.getMonth()] + '/' + d.getFullYear();
}

function getMesFromDate(dateStr) {
  const d = new Date(dateStr);
  return MESES[d.getMonth()] + '/' + d.getFullYear();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Tabs ──────────────────────────────────────────────────────────────

function showTab(tab) {
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', (tab === 'nova' ? i === 0 : i === 1));
  });
  document.getElementById('sec-nova').classList.toggle('active', tab === 'nova');
  document.getElementById('sec-hist').classList.toggle('active', tab === 'hist');
  if (tab === 'hist') renderHistorico();
}

// ── Counter & Progress ───────────────────────────────────────────────

function updateCounter() {
  const total = registros.length;
  const lancadas = registros.filter(r => r.lancada).length;
  const pct = total > 0 ? Math.round((lancadas / total) * 100) : 0;

  const pill = document.getElementById('counter-pill');
  pill.textContent = total;
  pill.classList.toggle('done', total > 0 && lancadas === total);

  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent =
    `${lancadas} de ${total} fichas lançadas (${pct}%)`;
}

// ══════════════════════════════════════════════════════════════════════
// FICHA GENERATION (BUG FIX: preserves existing data)
// ══════════════════════════════════════════════════════════════════════

function gerarFichas() {
  const qtd = parseInt(document.getElementById('qtd').value) || 0;
  const container = document.getElementById('fichas-container');
  const currentCount = container.children.length;

  // Remove excess fichas from the end
  while (container.children.length > qtd) {
    container.removeChild(container.lastChild);
  }

  // Add new fichas at the end (preserves already-filled fichas)
  for (let i = currentCount; i < qtd; i++) {
    const div = document.createElement('div');
    div.innerHTML = createFichaHTML(i);
    container.appendChild(div.firstElementChild);
  }
}

function createFichaHTML(i) {
  const num = i + 1;
  return `
  <div class="ficha-wrap" id="ficha-${i}">
    <div class="ficha-header" onclick="toggleFicha(${i})">
      <div class="ficha-header-left">
        <i class="ti ti-user"></i>
        <span>Pessoa ${num}</span>
      </div>
      <i class="ti ti-chevron-down" id="chev-${i}"></i>
    </div>
    <div class="ficha-body" id="body-${i}" style="display:${i === 0 ? 'block' : 'none'}">
      <div class="field">
        <label>Nome (opcional)</label>
        <input type="text" id="nome-${i}" placeholder="Nome da pessoa">
      </div>
      <div class="field">
        <label>Faixa etária <span class="required">*</span></label>
        <select id="faixa-${i}" onchange="showQs(${i})">
          <option value="">Selecione...</option>
          <option value="0-6">Menor de 6 meses</option>
          <option value="6-23">6 a 23 meses</option>
          <option value="2+">2 anos ou mais</option>
        </select>
      </div>
      <div class="field">
        <label>Sexo <span class="required">*</span></label>
        <div class="sex-row">
          <div class="sex-btn" onclick="setSex(${i},'F')" id="sf-${i}">♀ Feminino</div>
          <div class="sex-btn" onclick="setSex(${i},'M')" id="sm-${i}">♂ Masculino</div>
        </div>
        <input type="hidden" id="sexo-${i}">
      </div>
      <div id="qs-${i}"></div>
    </div>
  </div>`;
}

// ── Ficha Interactions ───────────────────────────────────────────────

function toggleFicha(i) {
  const body = document.getElementById('body-' + i);
  const chev = document.getElementById('chev-' + i);
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  chev.className = isOpen ? 'ti ti-chevron-down' : 'ti ti-chevron-up';
}

function setSex(i, v) {
  document.getElementById('sexo-' + i).value = v;
  document.getElementById('sf-' + i).classList.toggle('sel', v === 'F');
  document.getElementById('sm-' + i).classList.toggle('sel', v === 'M');
}

function showQs(i) {
  const faixa = document.getElementById('faixa-' + i).value;
  const container = document.getElementById('qs-' + i);
  if (!faixa) { container.innerHTML = ''; return; }

  const bank = faixa === '0-6' ? Q06 : faixa === '6-23' ? Q623 : Q2P;
  container.innerHTML = buildQs(bank, i);
}

// ══════════════════════════════════════════════════════════════════════
// QUESTION RENDERING
// ══════════════════════════════════════════════════════════════════════

function buildQs(bank, i) {
  let h = '<div class="ficha-sep">Marcadores de consumo alimentar</div>';
  bank.forEach(q => {
    if (q.type === 'meal') {
      h += `<div class="q-item"><div class="q-text">${q.txt}</div>
        <div class="meal-grid" id="meal-${i}">`;
      MEALS.forEach(m => {
        h += `<div class="meal-chip" onclick="togOpt(this)" data-q="${q.id}" data-val="${m}">${m}</div>`;
      });
      h += `</div></div>`;
    } else {
      h += `<div class="q-item"><div class="q-text">${q.txt}</div><div class="opts">`;
      h += renderTri(q.id, i);
      h += `</div>`;

      // Sub-questions
      if (q.sub) {
        h += `<div class="sub-q" id="sub-${q.id}-${i}" style="display:none">`;
        if (q.sub.type === 'vez') {
          h += `<div class="sub-label">Quantas vezes?</div><div class="opts">`;
          ['1 vez', '2 vezes', '3 ou mais'].forEach(v => {
            h += `<div class="opt" onclick="selOpt(this)" data-q="${q.sub.id}" data-i="${i}" data-val="${v}">${v}</div>`;
          });
          h += `</div>`;
        } else if (q.sub.type === 'vezcons') {
          h += `<div class="sub-label">Quantas vezes?</div><div class="opts">`;
          ['1 vez', '2 vezes', '3 ou mais'].forEach(v => {
            h += `<div class="opt" onclick="selOpt(this)" data-q="${q.sub.idvez}" data-i="${i}" data-val="${v}">${v}</div>`;
          });
          h += `</div>`;
          h += `<div class="sub-label" style="margin-top:10px">Consistência?</div><div class="opts">`;
          CONS_OPTS.forEach(v => {
            h += `<div class="opt" onclick="selOpt(this)" data-q="${q.sub.idcons}" data-i="${i}" data-val="${v}">${v}</div>`;
          });
          h += `</div>`;
        }
        h += `</div>`;
      }

      h += `</div>`;
    }
  });
  return h;
}

function renderTri(qid, i) {
  return ['Sim', 'Não', 'Não sabe'].map(v => {
    const cls = v === 'Sim' ? 'sim' : v === 'Não' ? 'nao' : 'ns';
    return `<div class="opt" onclick="selOpt(this)" data-q="${qid}" data-i="${i}" data-val="${v}" data-cls="${cls}">${v}</div>`;
  }).join('');
}

function selOpt(el) {
  // Deselect siblings
  el.parentElement.querySelectorAll('.opt').forEach(o => {
    o.classList.remove('sel-sim', 'sel-nao', 'sel-ns', 'sel-other');
  });
  const cls = el.dataset.cls || 'other';
  el.classList.add('sel-' + cls);

  // Show/hide sub-question if main answer is Sim
  const qId = el.dataset.q;
  const idx = el.dataset.i;
  const sub = document.getElementById('sub-' + qId + '-' + idx);
  if (sub) {
    sub.style.display = el.dataset.val === 'Sim' ? 'block' : 'none';
  }
}

function togOpt(el) {
  el.classList.toggle('sel');
}

// ══════════════════════════════════════════════════════════════════════
// CAPTURE RESPONSES (BUG FIX: removed dead MEALS.forEach loop)
// ══════════════════════════════════════════════════════════════════════

function capturarRespostas(i, faixa) {
  const respostas = {};
  const bank = faixa === '0-6' ? Q06 : faixa === '6-23' ? Q623 : Q2P;

  bank.forEach(q => {
    if (q.type === 'meal') {
      // Capture selected meal chips
      const container = document.getElementById('meal-' + i);
      if (container) {
        const selected = [];
        container.querySelectorAll('.meal-chip.sel').forEach(chip => {
          selected.push(chip.dataset.val);
        });
        respostas[q.id] = selected;
      }
    } else {
      // Capture tri-option (Sim/Não/Não sabe)
      const selEl = document.querySelector(`.opt[data-q="${q.id}"][data-i="${i}"].sel-sim, .opt[data-q="${q.id}"][data-i="${i}"].sel-nao, .opt[data-q="${q.id}"][data-i="${i}"].sel-ns`);
      if (selEl) {
        respostas[q.id] = selEl.dataset.val;
      }

      // Capture sub-questions
      if (q.sub) {
        if (q.sub.type === 'vez') {
          const subEl = document.querySelector(`.opt[data-q="${q.sub.id}"][data-i="${i}"].sel-other`);
          if (subEl) respostas[q.sub.id] = subEl.dataset.val;
        } else if (q.sub.type === 'vezcons') {
          const vezEl = document.querySelector(`.opt[data-q="${q.sub.idvez}"][data-i="${i}"].sel-other`);
          if (vezEl) respostas[q.sub.idvez] = vezEl.dataset.val;
          const consEl = document.querySelector(`.opt[data-q="${q.sub.idcons}"][data-i="${i}"].sel-other`);
          if (consEl) respostas[q.sub.idcons] = consEl.dataset.val;
        }
      }
    }
  });

  return respostas;
}

// ══════════════════════════════════════════════════════════════════════
// SAVE (async, Supabase)
// ══════════════════════════════════════════════════════════════════════

async function salvar() {
  const familia = document.getElementById('familia').value.trim();
  const qtd = parseInt(document.getElementById('qtd').value) || 0;

  if (!familia) { showToast('Informe o nome da família'); return; }
  if (qtd < 1) { showToast('Informe o número de pessoas'); return; }

  const rows = [];
  const grupoId = crypto.randomUUID();

  for (let i = 0; i < qtd; i++) {
    const faixa = document.getElementById('faixa-' + i).value;
    const sexo = document.getElementById('sexo-' + i).value;

    if (!faixa) { showToast(`Pessoa ${i + 1}: selecione a faixa etária`); return; }
    if (!sexo) { showToast(`Pessoa ${i + 1}: selecione o sexo`); return; }

    const nome = document.getElementById('nome-' + i).value.trim();
    const respostas = capturarRespostas(i, faixa);

    rows.push({
      user_id: currentUser.id,
      grupo_id: grupoId,
      familia: familia,
      pessoa_nome: nome || null,
      pessoa_num: i + 1,
      total_familia: qtd,
      faixa: faixa,
      sexo: sexo,
      respostas: respostas,
      lancada: false
    });
  }

  // Disable save button + show spinner
  const btn = document.getElementById('btn-salvar');
  const spinner = document.getElementById('save-spinner');
  btn.disabled = true;
  btn.classList.add('loading');
  spinner.style.display = 'block';
  btn.querySelector('span').style.display = 'none';

  try {
    const { data, error } = await db.from('avaliacoes').insert(rows).select();

    if (error) throw error;

    // Add returned rows to local cache
    registros = [...data, ...registros];
    updateCounter();
    showToast(`✓ ${data.length} ficha(s) salva(s)!`);

    // Reset form
    document.getElementById('familia').value = '';
    document.getElementById('qtd').value = '';
    document.getElementById('fichas-container').innerHTML = '';

  } catch (err) {
    console.error('Erro ao salvar:', err);
    showToast('Erro ao salvar: ' + (err.message || 'tente novamente'));
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    spinner.style.display = 'none';
    btn.querySelector('span').style.display = '';
  }
}

// ══════════════════════════════════════════════════════════════════════
// TOGGLE LANÇADA (async, Supabase)
// ══════════════════════════════════════════════════════════════════════

async function toggleLancada(id) {
  const rec = registros.find(r => r.id === id);
  if (!rec) return;

  const newVal = !rec.lancada;

  try {
    const { data, error } = await db.from('avaliacoes')
      .update({ lancada: newVal })
      .eq('id', id)
      .select();

    if (error) throw error;

    rec.lancada = newVal;
    updateCounter();
    renderHistorico();
  } catch (err) {
    console.error('Erro ao atualizar:', err);
    showToast('Erro ao atualizar status');
  }
}

// ══════════════════════════════════════════════════════════════════════
// DELETE (async, with confirm dialog)
// ══════════════════════════════════════════════════════════════════════

function showConfirm(title, text, onConfirm) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-text').textContent = text;
  const actionBtn = document.getElementById('confirm-action');
  // Clone to remove previous listeners
  const newBtn = actionBtn.cloneNode(true);
  actionBtn.parentNode.replaceChild(newBtn, actionBtn);
  newBtn.id = 'confirm-action';
  newBtn.onclick = () => {
    closeConfirm();
    onConfirm();
  };
  document.getElementById('confirm-overlay').classList.remove('hidden');
}

function closeConfirm() {
  document.getElementById('confirm-overlay').classList.add('hidden');
}

async function excluirFicha(id) {
  const rec = registros.find(r => r.id === id);
  const nome = rec ? (rec.pessoa_nome || `Pessoa ${rec.pessoa_num}`) : 'esta ficha';

  showConfirm(
    'Excluir ficha?',
    `Deseja excluir "${nome}"? Esta ação não pode ser desfeita.`,
    async () => {
      try {
        const { error } = await db.from('avaliacoes').delete().eq('id', id);
        if (error) throw error;

        registros = registros.filter(r => r.id !== id);
        updateCounter();
        renderHistorico();
        showToast('Ficha excluída');
      } catch (err) {
        console.error('Erro ao excluir:', err);
        showToast('Erro ao excluir ficha');
      }
    }
  );
}

async function excluirGrupo(grupoId, event) {
  if (event) event.stopPropagation();

  const grupoRegistros = registros.filter(r => r.grupo_id === grupoId);
  const familia = grupoRegistros.length > 0 ? grupoRegistros[0].familia : 'esta família';

  showConfirm(
    'Excluir família inteira?',
    `Deseja excluir todas as ${grupoRegistros.length} fichas de "${familia}"? Esta ação não pode ser desfeita.`,
    async () => {
      try {
        const { error } = await db.from('avaliacoes').delete().eq('grupo_id', grupoId);
        if (error) throw error;

        registros = registros.filter(r => r.grupo_id !== grupoId);
        updateCounter();
        renderHistorico();
        showToast(`Família "${familia}" excluída`);
      } catch (err) {
        console.error('Erro ao excluir grupo:', err);
        showToast('Erro ao excluir família');
      }
    }
  );
}

// ══════════════════════════════════════════════════════════════════════
// HISTORY RENDERING
// ══════════════════════════════════════════════════════════════════════

function renderHistorico() {
  const container = document.getElementById('historico');
  const searchText = (document.getElementById('filter-text')?.value || '').toLowerCase();
  const filterMonth = document.getElementById('filter-month')?.value || '';

  // Apply filters
  const filteredRegistros = registros.filter(r => {
    const matchText = r.familia.toLowerCase().includes(searchText);
    const matchMonth = filterMonth ? getMesFromDate(r.created_at) === filterMonth : true;
    return matchText && matchMonth;
  });

  if (filteredRegistros.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-clipboard-off"></i>
        <p>Nenhuma avaliação encontrada.</p>
      </div>`;
    updateStats(filteredRegistros);
    return;
  }

  // Group by grupo_id
  const groups = {};
  filteredRegistros.forEach(r => {
    if (!groups[r.grupo_id]) groups[r.grupo_id] = [];
    groups[r.grupo_id].push(r);
  });

  let h = '';
  Object.entries(groups).forEach(([grupoId, fichas]) => {
    const fam = fichas[0].familia;
    const total = fichas.length;
    const lancadas = fichas.filter(f => f.lancada).length;
    const dateStr = fichas[0].created_at;
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const mesAno = getMesFromDate(dateStr);

    // Badge class
    let badgeCls = 'none', badgeTxt = `0/${total}`;
    if (lancadas === total) { badgeCls = 'all'; badgeTxt = `${total}/${total}`; }
    else if (lancadas > 0) { badgeCls = 'partial'; badgeTxt = `${lancadas}/${total}`; }

    // Initials
    const initials = fam.substring(0, 2).toUpperCase();

    h += `<div class="hist-grupo">
      <div class="hist-grupo-header" onclick="toggleGrupo('${grupoId}')">
        <div class="hist-avatar">${initials}</div>
        <div class="hist-info">
          <div class="hist-name">${fam}</div>
          <div class="hist-meta">${total} pessoa(s) · ${mesAno}</div>
        </div>
        <div class="hist-date">${dateFormatted}</div>
        <span class="grupo-badge ${badgeCls}">${badgeTxt}</span>
        <button class="btn-del-grupo" onclick="excluirGrupo('${grupoId}', event)" title="Excluir família"><i class="ti ti-trash"></i></button>
      </div>
      <div class="hist-fichas" id="grp-${grupoId}" style="display:none">`;

    fichas.forEach(f => {
      const nome = f.pessoa_nome || `Pessoa ${f.pessoa_num}`;
      const faixaLabel = f.faixa === '0-6' ? '<6m' : f.faixa === '6-23' ? '6-23m' : '2+';
      const sexLabel = f.sexo === 'F' ? '♀' : '♂';
      const lancCls = f.lancada ? 'launched active' : 'launched';

      h += `<div class="hist-ficha-row">
        <div class="hist-ficha-info">
          <div class="hist-ficha-nome">${nome}</div>
          <div class="hist-ficha-sub">${sexLabel} ${faixaLabel}</div>
        </div>
        <div class="btn-row">
          <button class="btn-sm view" onclick="verFicha('${f.id}')"><i class="ti ti-eye"></i></button>
          <button class="btn-sm ${lancCls}" onclick="toggleLancada('${f.id}')"><i class="ti ti-check"></i></button>
          <button class="btn-sm delete" onclick="excluirFicha('${f.id}')"><i class="ti ti-trash"></i></button>
        </div>
      </div>`;
    });

    h += `</div></div>`;
  });

  container.innerHTML = h;
  updateStats(filteredRegistros);
}

function toggleGrupo(grupoId) {
  const el = document.getElementById('grp-' + grupoId);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function updateStats(filteredList = registros) {
  const total = filteredList.length;
  const lancadas = filteredList.filter(r => r.lancada).length;
  const familias = new Set(filteredList.map(r => r.grupo_id)).size;
  const mesAtual = getMes();
  const mesFichas = filteredList.filter(r => getMesFromDate(r.created_at) === mesAtual).length;

  document.getElementById('st-total').textContent = total;
  document.getElementById('st-lancadas').textContent = lancadas;
  document.getElementById('st-familias').textContent = familias;
  document.getElementById('st-mes').textContent = mesFichas;
}

function populateMonthFilter() {
  const select = document.getElementById('filter-month');
  if (!select) return;
  
  const months = new Set(registros.map(r => getMesFromDate(r.created_at)));
  
  // Keep the first default option
  const defaultOption = select.options[0];
  select.innerHTML = '';
  select.appendChild(defaultOption);
  
  Array.from(months).forEach(month => {
    const opt = document.createElement('option');
    opt.value = month;
    opt.textContent = month;
    select.appendChild(opt);
  });
}

// ══════════════════════════════════════════════════════════════════════
// VIEW FICHA (Modal)
// ══════════════════════════════════════════════════════════════════════

function verFicha(id) {
  const r = registros.find(x => x.id === id);
  if (!r) return;

  const nome = r.pessoa_nome || `Pessoa ${r.pessoa_num}`;
  const faixaLabel = r.faixa === '0-6' ? 'Menor de 6 meses' : r.faixa === '6-23' ? '6 a 23 meses' : '2 anos ou mais';
  const sexLabel = r.sexo === 'F' ? 'Feminino' : 'Masculino';
  const bank = r.faixa === '0-6' ? Q06 : r.faixa === '6-23' ? Q623 : Q2P;

  document.getElementById('modal-title').textContent = nome;

  let h = `
    <div class="modal-section">
      <div class="modal-section-title">Dados pessoais</div>
      <div class="modal-row"><span class="modal-label">Família</span><span class="modal-val">${r.familia}</span></div>
      <div class="modal-row"><span class="modal-label">Faixa etária</span><span class="modal-val">${faixaLabel}</span></div>
      <div class="modal-row"><span class="modal-label">Sexo</span><span class="modal-val">${sexLabel}</span></div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">Marcadores de consumo</div>`;

  bank.forEach(q => {
    const val = r.respostas[q.id];
    if (q.type === 'meal') {
      const meals = Array.isArray(val) ? val.join(', ') : (val || '—');
      h += `<div class="modal-row"><span class="modal-label">${q.txt}</span><span class="modal-val other">${meals}</span></div>`;
    } else {
      const cls = val === 'Sim' ? 'sim' : val === 'Não' ? 'nao' : val === 'Não sabe' ? 'ns' : '';
      h += `<div class="modal-row"><span class="modal-label">${q.txt}</span><span class="modal-val ${cls}">${val || '—'}</span></div>`;

      // Sub-questions
      if (q.sub) {
        if (q.sub.type === 'vez' && r.respostas[q.sub.id]) {
          h += `<div class="modal-row"><span class="modal-label" style="padding-left:14px">↳ Vezes</span><span class="modal-val other">${r.respostas[q.sub.id]}</span></div>`;
        } else if (q.sub.type === 'vezcons') {
          if (r.respostas[q.sub.idvez]) {
            h += `<div class="modal-row"><span class="modal-label" style="padding-left:14px">↳ Vezes</span><span class="modal-val other">${r.respostas[q.sub.idvez]}</span></div>`;
          }
          if (r.respostas[q.sub.idcons]) {
            h += `<div class="modal-row"><span class="modal-label" style="padding-left:14px">↳ Consistência</span><span class="modal-val other">${r.respostas[q.sub.idcons]}</span></div>`;
          }
        }
      }
    }
  });

  h += `</div>`;
  document.getElementById('modal-body').innerHTML = h;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ══════════════════════════════════════════════════════════════════════
// LOAD DATA FROM SUPABASE
// ══════════════════════════════════════════════════════════════════════

async function loadRegistros() {
  try {
    const { data, error } = await db.from('avaliacoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    registros = data || [];
    populateMonthFilter();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    showToast('Erro ao carregar dados');
    registros = [];
  }
}

// ══════════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════════

async function initApp() {
  try {
    currentUser = await requireAuth();
    if (!currentUser) return; // requireAuth redirects if not logged in

    // Display user email
    document.getElementById('user-email').textContent = currentUser.email || '';

    // Load data from Supabase
    await loadRegistros();
    updateCounter();

  } catch (err) {
    console.error('Erro ao inicializar:', err);
    showToast('Erro ao inicializar aplicação');
  }
}

initApp();
