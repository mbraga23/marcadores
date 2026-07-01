// ══════════════════════════════════════════════════════════════════════
// Marcador de Consumo Alimentar — Export (CSV / JSON)
// ══════════════════════════════════════════════════════════════════════

// ── Download Helper ──────────────────────────────────────────────────

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getExportDate() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

// ── CSV Escape ───────────────────────────────────────────────────────

function csvEscape(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// ══════════════════════════════════════════════════════════════════════
// EXPORT CSV
// ══════════════════════════════════════════════════════════════════════

function exportCSV() {
  if (registros.length === 0) {
    showToast('Nenhum dado para exportar');
    return;
  }

  // Collect ALL question IDs across all faixas for column headers
  // We use a stable ordering: Q06 questions, then Q623 extras, then Q2P extras
  const allQIds = [];
  const allQLabels = {};
  const seen = new Set();

  [Q06, Q623, Q2P].forEach(bank => {
    bank.forEach(q => {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        allQIds.push(q.id);
        allQLabels[q.id] = q.txt;
      }
      // Sub-question columns
      if (q.sub) {
        if (q.sub.type === 'vez' && !seen.has(q.sub.id)) {
          seen.add(q.sub.id);
          allQIds.push(q.sub.id);
          allQLabels[q.sub.id] = q.txt + ' (vezes)';
        } else if (q.sub.type === 'vezcons') {
          if (!seen.has(q.sub.idvez)) {
            seen.add(q.sub.idvez);
            allQIds.push(q.sub.idvez);
            allQLabels[q.sub.idvez] = q.txt + ' (vezes)';
          }
          if (!seen.has(q.sub.idcons)) {
            seen.add(q.sub.idcons);
            allQIds.push(q.sub.idcons);
            allQLabels[q.sub.idcons] = q.txt + ' (consistência)';
          }
        }
      }
    });
  });

  // Header row
  const fixedCols = ['Família', 'Pessoa', 'Sexo', 'Faixa Etária', 'Data', 'Lançada'];
  const header = [...fixedCols, ...allQIds.map(id => allQLabels[id])];

  const rows = [header.map(csvEscape).join(',')];

  // Data rows
  registros.forEach(r => {
    const date = new Date(r.created_at).toLocaleDateString('pt-BR');
    const faixaLabel = r.faixa === '0-6' ? '<6 meses' : r.faixa === '6-23' ? '6-23 meses' : '2+ anos';
    const nome = r.pessoa_nome || `Pessoa ${r.pessoa_num}`;

    const fixed = [
      r.familia,
      nome,
      r.sexo === 'F' ? 'Feminino' : 'Masculino',
      faixaLabel,
      date,
      r.lancada ? 'Sim' : 'Não'
    ];

    const qCols = allQIds.map(id => {
      const val = r.respostas[id];
      if (val == null) return '';
      if (Array.isArray(val)) return val.join('; ');
      return val;
    });

    rows.push([...fixed, ...qCols].map(csvEscape).join(','));
  });

  // BOM for Excel UTF-8 compatibility
  const csv = '\uFEFF' + rows.join('\n');
  downloadFile(csv, `marcador_consumo_${getExportDate()}.csv`, 'text/csv;charset=utf-8');
  showToast('CSV exportado!');
}

// ══════════════════════════════════════════════════════════════════════
// EXPORT JSON
// ══════════════════════════════════════════════════════════════════════

function exportJSON() {
  if (registros.length === 0) {
    showToast('Nenhum dado para exportar');
    return;
  }

  const json = JSON.stringify(registros, null, 2);
  downloadFile(json, `marcador_consumo_${getExportDate()}.json`, 'application/json;charset=utf-8');
  showToast('JSON exportado!');
}

// ══════════════════════════════════════════════════════════════════════
// EXPORT PDF
// ══════════════════════════════════════════════════════════════════════

function getFilteredRegistros() {
  const searchText = (document.getElementById('filter-text')?.value || '').toLowerCase();
  const filterMonth = document.getElementById('filter-month')?.value || '';

  return registros.filter(r => {
    const matchText = r.familia.toLowerCase().includes(searchText);
    const matchMonth = filterMonth ? getMesFromDate(r.created_at) === filterMonth : true;
    return matchText && matchMonth;
  });
}

function exportPDFResumo() {
  const data = getFilteredRegistros();
  if (data.length === 0) {
    showToast('Nenhum dado para exportar');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Resumo Mensal - Marcador Alimentar', 14, 20);
  
  // Stats
  const lancadas = data.filter(r => r.lancada).length;
  const familias = new Set(data.map(r => r.grupo_id)).size;
  doc.setFontSize(12);
  doc.text(`Total de Fichas: ${data.length} (${lancadas} lançadas)`, 14, 30);
  doc.text(`Total de Famílias: ${familias}`, 14, 37);

  // Group by family
  const groups = {};
  data.forEach(r => {
    if (!groups[r.grupo_id]) groups[r.grupo_id] = [];
    groups[r.grupo_id].push(r);
  });

  const tableData = Object.values(groups).map(fichas => {
    const date = new Date(fichas[0].created_at).toLocaleDateString('pt-BR');
    return [
      fichas[0].familia,
      fichas.length.toString(),
      date
    ];
  });

  doc.autoTable({
    startY: 45,
    head: [['Família', 'Qtd. Pessoas', 'Data da Visita']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [29, 158, 117] }
  });

  doc.save(`resumo_mensal_${getExportDate()}.pdf`);
  showToast('PDF Resumo exportado!');
}

function exportPDFDetalhado() {
  const data = getFilteredRegistros();
  if (data.length === 0) {
    showToast('Nenhum dado para exportar');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape');
  
  doc.setFontSize(18);
  doc.text('Relatório Detalhado - Marcador Alimentar', 14, 20);

  // Create table data matching CSV
  const allQIds = [];
  const allQLabels = {};
  const seen = new Set();

  [Q06, Q623, Q2P].forEach(bank => {
    bank.forEach(q => {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        allQIds.push(q.id);
        allQLabels[q.id] = q.txt.length > 25 ? q.txt.substring(0,25) + '...' : q.txt;
      }
    });
  });

  const fixedCols = ['Família', 'Pessoa', 'Idade'];
  const header = [...fixedCols, ...allQIds.map(id => allQLabels[id])];

  const tableData = data.map(r => {
    const faixaLabel = r.faixa === '0-6' ? '<6m' : r.faixa === '6-23' ? '6-23m' : '2+';
    const nome = r.pessoa_nome || `Pessoa ${r.pessoa_num}`;

    const fixed = [ r.familia, nome, faixaLabel ];

    const qCols = allQIds.map(id => {
      const val = r.respostas[id];
      if (val == null) return '-';
      if (Array.isArray(val)) return 'Sim'; // Compress meal arrays to "Sim" for PDF space
      return val.substring(0,3); // Sim, Não, Não (sabe)
    });

    return [...fixed, ...qCols];
  });

  doc.autoTable({
    startY: 30,
    head: [header],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1 },
    headStyles: { fillColor: [29, 158, 117], fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 20 },
      2: { cellWidth: 10 }
    }
  });

  doc.save(`relatorio_detalhado_${getExportDate()}.pdf`);
  showToast('PDF Detalhado exportado!');
}
