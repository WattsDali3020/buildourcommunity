/* RevitaHub Urban Dynamics – static SPA (Leaflet + Chart.js). No build step. */
(function () {
  'use strict';
  var COLORS = {green: '#2e9e5b', yellow: '#e0b020', red: '#d14343', none: '#9aa5a0'};
  var WORD = {green: 'Growth', yellow: 'Stagnation', red: 'Decline'};
  var GROUPS = [
    ['Business', ['business_new_enterprise', 'business_mature', 'business_declining_industry']],
    ['Housing', ['housing_premium', 'housing_worker', 'housing_underemployed']],
    ['Labor', ['labor_managerial', 'labor_labor', 'labor_underemployed']]
  ];
  var RING = ['crime', 'education', 'health', 'pollution', 'traffic', 'land_value', 'city_cash_flow', 'tax_rate'];
  var RI_BOUNDS, DATA, BY = {}, MARK = {}, POLY = {}, map, selected = null, charts = [];

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
  function col(s) { return COLORS[s] || COLORS.none; }
  function fmt(v) {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'number') return Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-US') : String(Math.round(v * 1000) / 1000);
    if (typeof v === 'object') return Object.keys(v).map(function (k) { return k + ':' + fmt(v[k]); }).join(', ');
    return String(v);
  }
  function sgn(x) { return x > 0 ? '+' : x < 0 ? '−' : ''; }

  Promise.all([fetch('data/scores.json').then(chk), fetch('data/boundaries.json').then(chk)]).then(function (r) {
    DATA = r[0]; init(DATA, r[1]);
  }).catch(function (e) {
    $('panelBody').innerHTML = '<h2>Could not load data</h2><p class="muted">' + esc(e.message || e) + '</p>';
  });
  function chk(r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + r.url); return r.json(); }

  function init(d, bounds) {
    d.municipalities.forEach(function (m) { BY[m.geoid] = m; });
    var sel = $('muniSelect');
    d.municipalities.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (m) {
      var o = document.createElement('option'); o.value = m.geoid;
      o.textContent = m.name + (m.overall.status ? ' – ' + WORD[m.overall.status] : ' – not scored'); sel.appendChild(o);
    });
    sel.addEventListener('change', function () { if (sel.value) select(sel.value, true); });
    $('closeBtn').addEventListener('click', function () { $('panel').classList.add('hidden'); });

    var c = d.summary.status_counts;
    $('counts').innerHTML = d.summary.scored + ' of ' + d.summary.municipalities + ' scored:' +
      '<i style="background:' + COLORS.green + '"></i>' + c.green + ' growth<i style="background:' + COLORS.yellow + '"></i>' + c.yellow + ' stagnation<i style="background:' + COLORS.red + '"></i>' + c.red + ' decline';

    map = L.map('map', {zoomControl: true}).setView([41.68, -71.52], 9);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Boundaries: U.S. Census Bureau TIGERweb'}).addTo(map);

    var bl = L.geoJSON(bounds, {
      style: function (f) { var m = BY[f.properties.GEOID]; var s = m && m.overall.status; return {color: '#33443b', weight: 1, fillColor: col(s), fillOpacity: 0.22}; },
      onEachFeature: function (f, layer) {
        POLY[f.properties.GEOID] = layer;
        layer.on('click', function () { select(f.properties.GEOID, false); });
      }
    }).addTo(map);
    RI_BOUNDS = bl.getBounds(); map.fitBounds(RI_BOUNDS, {padding: [10, 10]});

    d.municipalities.forEach(function (m) {
      var s = m.overall.status;
      var mk = L.circleMarker([m.lat, m.lon], {radius: 9, color: '#fff', weight: 2, fillColor: col(s), fillOpacity: 0.95});
      mk.bindTooltip(m.name + ' – ' + (s ? WORD[s] : 'not scored'), {direction: 'top', className: 'mt'});
      mk.on('click', function () { select(m.geoid, false); });
      mk.addTo(map); MARK[m.geoid] = mk;
    });

    var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function () {
      var div = L.DomUtil.create('div', 'legend');
      div.innerHTML = '<b>Overall status</b><br>' +
        ['green', 'yellow', 'red'].map(function (s) { return '<i style="background:' + COLORS[s] + '"></i>' + WORD[s] + ({green: ' (green)', yellow: ' (yellow)', red: ' (red)'})[s]; }).join('<br>') +
        '<small>Compared with other RI municipalities, not an absolute rating.</small>';
      return div;
    };
    legend.addTo(map);

    var h = (location.hash || '').replace('#', '');
    if (BY[h]) select(h, true); else $('panel').classList.add('empty');
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
    setTimeout(function () { map.invalidateSize(); if (!BY[h]) map.fitBounds(RI_BOUNDS, {padding: [10, 10]}); }, 300);
    window.__ud = {select: select, ids: Object.keys(BY)};
    window.__ready = true;
  }

  function select(geoid, pan) {
    var m = BY[geoid]; if (!m) return;
    if (selected && MARK[selected]) { MARK[selected].setStyle({weight: 2, radius: 9, color: '#fff'}); }
    if (selected && POLY[selected]) { POLY[selected].setStyle({weight: 1, color: '#33443b'}); }
    selected = geoid;
    MARK[geoid].setStyle({weight: 4, radius: 12, color: '#12372a'}); MARK[geoid].bringToFront();
    if (POLY[geoid]) POLY[geoid].setStyle({weight: 3, color: '#12372a'});
    $('muniSelect').value = geoid;
    try { history.replaceState(null, '', '#' + geoid); } catch (e) {}
    var p = $('panel'); p.classList.remove('empty'); p.classList.remove('hidden');
    render(m); p.scrollTop = 0;
    var mobile = window.innerWidth <= 760;
    if (pan || mobile) {
      var z = Math.max(map.getZoom(), 10), pt = map.project([m.lat, m.lon], z);
      if (mobile) pt = pt.add([0, p.offsetHeight / 2]);
      map.flyTo(map.unproject(pt, z), z, {duration: 0.6});
    }
  }

  function destroyCharts() { charts.forEach(function (c) { c.destroy(); }); charts = []; }

  var valueLabels = {id: 'valueLabels', afterDatasetsDraw: function (chart) {
    var ctx = chart.ctx, meta = chart.getDatasetMeta(0), ds = chart.data.datasets[0];
    ctx.save(); ctx.font = '600 11px system-ui,sans-serif'; ctx.fillStyle = '#16231d'; ctx.textBaseline = 'middle';
    meta.data.forEach(function (bar, i) {
      var v = ds.raw[i], txt = v === null ? 'no data' : sgn(v) + Math.abs(v).toFixed(2);
      var pos = bar.getProps(['x', 'y'], true), x0 = chart.scales.x.getPixelForValue(0), right = v === null || v >= 0;
      ctx.textAlign = 'left'; ctx.fillText(txt, (right ? pos.x : x0) + 4, pos.y);
    });
    ctx.restore();
  }};

  function render(m) {
    destroyCharts();
    var F = DATA.formulas, o = m.overall, s = o.status;
    var html = '<h2>' + esc(m.name) + '</h2><div class="muted small">' + esc(m.county || '') + ' County · GEOID ' + esc(m.geoid) + '</div>';
    html += '<p>' + (s ? '<span class="badge ' + s + '">' + WORD[s] + ' (' + s + ')</span> ' : '<span class="badge none">Not scored</span> ') +
      (o.score !== null ? 'overall score <b>' + sgn(o.score) + Math.abs(o.score).toFixed(3) + '</b> · ' : '') + 'confidence <b>' + Math.round((o.confidence || 0) * 100) + '%</b> · ' +
      o.bars_scored + '/9 bars, ' + o.ring_scored + '/8 ring items scored</p>';
    html += '<div class="note"><b>Peer-relative:</b> statuses compare Rhode Island municipalities with each other (z-scores / percentiles across the 39), not against an absolute standard. Proxy and missing inputs are flagged.</div>';

    html += '<h3>Demand bars <span class="muted small">(−1 deficit … +1 surplus)</span></h3>';
    GROUPS.forEach(function (g, gi) {
      html += '<div class="grp"><h4>' + g[0] + '</h4><div class="chartbox"><canvas id="bar' + gi + '" aria-label="' + g[0] + ' demand bars"></canvas></div></div>';
    });
    html += '<div class="axis"><span>← deficit (oversupplied)</span><span>surplus (unmet demand) →</span></div>';
    html += '<p class="muted small">⚠ Declining industry, underemployed housing and underemployed labor: a <i>surplus</i> signals stress, so a positive bar is colored by that polarity (red).</p>';

    html += '<h3>Feedback ring <span class="muted small">(0–100)</span></h3><div class="gauges">';
    RING.forEach(function (k, i) {
      var r = m.ring[k], f = F.ring[k];
      if (r.score === null) {
        html += '<div class="gauge nodata" title="' + esc(r.why || '') + '"><b>' + esc(f.label) + '</b><span>no data</span><span class="px">' + esc((r.why || '').slice(0, 90)) + '</span></div>';
      } else {
        html += '<div class="gauge"><b>' + esc(f.label) + '</b><canvas id="g' + i + '" aria-label="' + esc(f.label) + ' ' + r.score + ' of 100"></canvas><div class="val" style="color:' + col(r.status) + '">' + Math.round(r.score) +
          '</div><div class="dir">' + (f.direction === 'good' ? '▲ higher = better' : '▼ higher = worse') + '</div>' +
          (r.proxy ? '<div class="px">PROXY · conf ' + Math.round(r.conf * 100) + '%</div>' : (r.conf < 1 ? '<div class="px">partial · conf ' + Math.round(r.conf * 100) + '%</div>' : '')) + '</div>';
      }
    });
    html += '</div>';
    html += '<p class="muted small">Gauge color = status of the ring item (green ≥60 goodness, red &lt;40). Health has no free data in hand and is never invented.</p>';

    html += buildDrill(m);
    $('panelBody').innerHTML = html;

    GROUPS.forEach(function (g, gi) { charts.push(barChart($('bar' + gi), m, g[1], F)); });
    RING.forEach(function (k, i) {
      var r = m.ring[k]; if (r.score === null) return;
      charts.push(new Chart($('g' + i), {type: 'doughnut', data: {datasets: [{data: [r.score, 100 - r.score], backgroundColor: [col(r.status), '#e8ece9'], borderWidth: 0}]},
        options: {rotation: 270, circumference: 180, cutout: '68%', plugins: {legend: {display: false}, tooltip: {enabled: false}}, animation: {duration: 400}, events: []}}));
    });
  }

  function barChart(canvas, m, keys, F) {
    var labels = keys.map(function (k) { var b = F.bars[k]; return b.label + (b.polarity < 0 ? ' ⚠' : ''); });
    var raw = keys.map(function (k) { return m.bars[k].score; });
    var colors = keys.map(function (k) { return col(m.bars[k].status); });
    return new Chart(canvas, {type: 'bar', plugins: [valueLabels],
      data: {labels: labels, datasets: [{data: raw.map(function (v) { return v === null ? 0 : v; }), raw: raw, backgroundColor: colors.map(function (c, i) { return raw[i] === null ? '#d5dbd7' : c; }), borderRadius: 3, barThickness: 20}]},
      options: {indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: {duration: 400},
        layout: {padding: {right: 46, left: 4}},
        scales: {x: {min: -1, max: 1, ticks: {stepSize: 0.5, callback: function (v) { return v > 0 ? '+' + v : v; }}, grid: {color: function (c) { return c.tick.value === 0 ? '#16231d' : '#e3e8e4'; }}}, y: {grid: {display: false}, ticks: {font: {size: 11}}, afterFit: function (sc) { sc.width = 150; }}},
        plugins: {legend: {display: false}, tooltip: {callbacks: {label: function (c) {
          var k = keys[c.dataIndex], b = m.bars[k]; return b.score === null ? 'no data: ' + (b.why || '') : 'score ' + b.score + ' · status ' + b.status + ' · confidence ' + Math.round(b.conf * 100) + '%'; }}}}}});
  }

  /* ---- Formulas & sources drill-down ---- */
  function buildDrill(m) {
    var F = DATA.formulas, P = DATA.provenance, order = [], num = {};
    function cite(ref) { if (!ref) return ''; if (!(ref in num)) { order.push(ref); num[ref] = order.length; } return '[' + num[ref] + ']'; }
    function metricBlock(kind, k) {
      var r = (kind === 'bars' ? m.bars : m.ring)[k], f = F[kind][k];
      var title = f.label + ' — ' + (r.score === null ? 'no data' : (kind === 'bars' ? sgn(r.score) + Math.abs(r.score).toFixed(3) : r.score.toFixed(1)));
      var h = '<details><summary>' + esc(title) + ' <span class="badge ' + (r.status || 'none') + '">' + (r.status || 'null') + '</span>' +
        (r.proxy ? '<span class="flag">PROXY</span>' : '') + (r.conf < 1 ? '<span class="flag">confidence ' + Math.round(r.conf * 100) + '%</span>' : '') + '</summary><div class="in">';
      h += '<div>Formula: <code>' + esc(f.formula) + '</code></div>';
      if (f.notes) h += '<div class="muted">' + esc(f.notes) + '</div>';
      if (r.why) h += '<div class="flag">' + esc(r.why) + '</div>';
      if (r.c.length) {
        h += '<table><tr><th>Component</th><th>w·sign</th><th>value</th><th>' + (kind === 'bars' ? 'z' : 'pct') + '</th></tr>';
        r.c.forEach(function (c) {
          var ff = F.features[c.f] || {};
          h += '<tr><td><b>' + esc(c.f) + '</b><br><span class="muted">' + esc(ff.formula || '') + '</span><br>' +
            c.i.map(function (i) { return '<span class="cite">' + esc(i.n) + ' = ' + esc(fmt(i.v)) + ' ' + cite(i.p) + '</span>'; }).join('<br>') +
            (c.miss ? '<br><span class="flag">missing: ' + esc(c.miss.join('; ')) + '</span>' : '') + '</td>' +
            '<td class="num">' + (c.s > 0 ? '+' : '−') + c.w.toFixed(2) + '</td><td class="num">' + esc(fmt(c.v)) + '</td><td class="num">' + (c.z !== undefined ? c.z.toFixed(2) : c.pct !== undefined ? Math.round(c.pct) : '—') + '</td></tr>';
        });
        h += '</table>';
        h += '<div class="muted">coverage ' + Math.round(r.cov * 100) + '% · confidence ' + Math.round(r.conf * 100) + '%' + (kind === 'bars' ? ' · polarity ' + (r.signed !== undefined ? '(signed ' + r.signed + ')' : '') : ' · goodness ' + (r.goodness !== undefined ? r.goodness : '—')) + '</div>';
      }
      return h + '</div></details>';
    }
    var body = '<h3>Formulas &amp; sources</h3><details class="top"><summary>Show formulas, inputs, confidence flags and citations</summary><div class="in">';
    GROUPS.forEach(function (g) { body += '<h4>' + g[0] + ' demand bars</h4>' + g[1].map(function (k) { return metricBlock('bars', k); }).join(''); });
    body += '<h4>Feedback ring</h4>' + RING.map(function (k) { return metricBlock('ring', k); }).join('');
    var N = F.normalization, T = F.thresholds;
    body += '<h4>Method</h4><div class="muted small"><div>' + esc(N.z) + '</div><div>' + esc(N.pct) + '</div><div>' + esc(N.bar) + '</div><div>' + esc(N.ring) + '</div><div>' + esc(N.confidence) + '</div>' +
      '<div>Bar status: green ' + esc(T.bar.green) + '; red ' + esc(T.bar.red) + '.</div><div>Ring status: green ' + esc(T.ring.green) + '; red ' + esc(T.ring.red) + ' (goodness = ' + esc(T.ring.goodness) + ').</div>' +
      '<div>Overall: ' + esc(T.overall.formula) + '; green ' + esc(T.overall.green) + ', red ' + esc(T.overall.red) + '; requires ' + esc(T.overall.requires) + '.</div></div>';
    body += '<h4>Sources cited</h4><ol class="cite">' + order.map(function (ref) {
      var p = P[ref] || {}, arr = Array.isArray(p) ? p : [p];
      return arr.map(function (u) {
        var link = /^https?:\/\//.test(u.url || '') ? '<a href="' + esc(u.url) + '" target="_blank" rel="noopener">' + esc(u.url) + '</a>' : esc(u.url || '');
        return '<li>' + esc(u.source) + ' — ' + esc(u.dataset) + ' (vintage ' + esc(u.vintage) + ', retrieved ' + esc(u.retrieved_at) + '). ' + link + (u.note ? '<br>' + esc(u.note) : '') + '</li>';
      }).join('');
    }).join('') + '</ol></div></details>';
    return body;
  }
})();
