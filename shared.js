const ANTHROPIC_API_KEY = "your-API-key";

const PAGES = [
  { id: 'index',   label: 'Executive Command Center',       file: 'index.html' },
  { id: 'revenue', label: 'Revenue & Pipeline Intelligence', file: 'revenue-pipeline.html' },
  { id: 'growth',  label: 'Whitespace & Growth',             file: 'whitespace-growth.html' },
  { id: 'market',  label: 'Market & Competitive Intel',      file: 'market-competitive.html' },
  { id: 'gtm',     label: 'GTM Scorecard',                   file: 'gtm-scorecard.html' },
];

const SYSTEM_PROMPT = `You are Databook's AI Strategic Intelligence Engine embedded in a CRO dashboard for Procore Technologies (NYSE: PCOR). You have deep proprietary knowledge grounded in equity research and expert intelligence as of May 2026.

Key facts: FY2025 revenue $1.322B (+14.8% YoY); Q1 2026 revenue $359.3M (+15.7% YoY) — third straight quarter of re-acceleration; Q1 2026 operating margin 16.9% vs. 14.5% expected (240 bps beat); FCF Q1 2026 $56M (15.6% margin); cRPO Q1 2026 $1,019.5M (+21% YoY); customers >$100K ARR 2,795 (+16% YoY); NRR 106% (compressed from volume contracts); GRR 95%; Rule of 40 in low 30s. S&M as % of revenue: 35.2% Q1 2026, down from 41.4% FY2024, vs. peer median ~18%. FY2026E revenue $1.501B (+13.5%); FY2027E $1.696B (+13%).

ACV mix: GCs 63%, Owners 25%, Specialty 12%. Logo TAM penetration under 5%. International: 15% of revenue vs. 56% peer avg. Gross margin 84%.

New leadership all from Ansys: CEO Ajei Gopal (Nov 2025 — tripled Ansys revenue, 4x'd market cap), CRO Walt Hearn (April 2026, Day 60 — grew Ansys international to 50%+), CFO Rachel Pyles. Datagrid acquired Jan 2026 ($168M) for agentic AI. AI Agents Q3 2026 launch (consumption-based tokens). Procore Pay displacing Oracle Textura. FedRAMP Moderate achieved.

Procore internally uses Claude Code and Claude Excel plugin — Databook powered by Anthropic is a natural fit.

Win rates: vs. Autodesk 61% overall but only 44% when Owner CFO is primary buyer. Loss reasons: Business Case/ROI 31%, Executive Alignment 24%, Technical 18%, Pricing 17%, No Decision 10%.

Analyst targets: Jefferies BUY $95, KeyBanc OW $76, William Blair Outperform. Bull $94-118, Bear $40, current ~$55 (-18% YTD).

Answer as Databook's AI — commercially sharp, specific, actionable. Under 200 words unless asked for more.`;

function renderNav(activePage) {
  return `<nav class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <div class="brand-logo">
        <svg width="20" height="20" viewBox="0 0 24 24"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="#7C3AED" opacity="0.9"/><polygon points="12,6 18,9.5 18,16.5 12,20 6,16.5 6,9.5" fill="#7C3AED" opacity="0.35"/></svg>
        <span class="brand-name">databook</span>
      </div>
      <div class="brand-sub">for Procore Technologies</div>
    </div>
    <div class="nav-section-label">Q2 FY26 · CRO Dashboard</div>
    <ul class="nav-list">
      ${PAGES.map(p => `<li class="nav-item ${p.id===activePage?'active':''}">
        <a href="${p.file}" class="nav-link">${p.label}</a>
      </li>`).join('')}
    </ul>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="user-avatar">WH</div>
        <div class="user-info">
          <div class="user-name">Walt Hearn</div>
          <div class="user-role">Chief Revenue Officer</div>
        </div>
      </div>
      <button class="chat-toggle-btn" onclick="toggleChat()">
        <svg width="12" height="12" viewBox="0 0 24 24"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" stroke="#7C3AED" stroke-width="2" fill="none"/></svg>
        Ask Databook AI
      </button>
    </div>
  </nav>`;
}

// ---- DYNAMIC DATE HELPERS (always reflect today) ----
function _today(){ return new Date(); }
function todayLong(){ return _today().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}); }
function todayShort(){ return _today().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}); }
function fiscalQ(){ const d=_today(); const q=Math.floor(d.getMonth()/3)+1; return 'Q'+q+' FY'+String(d.getFullYear()).slice(2); }
// Walt Hearn started as CRO on April 1, 2026 — compute his tenure in days, live.
function croDay(){ const start=new Date(2026,3,1); const diff=Math.floor((_today()-start)/86400000); return diff>0?diff:1; }

function renderHeader(title, sub) {
  return `<header class="topbar" id="topbar">
    <div class="topbar-left">
      <button class="sidebar-toggle" onclick="toggleSidebar()">☰</button>
      <div><h1 class="topbar-title">${title}</h1>${sub?`<p class="topbar-sub">${sub}</p>`:''}</div>
    </div>
    <div class="topbar-center">
      <span class="topbar-company">Procore Technologies (NYSE: PCOR)</span>
      <span class="topbar-dot">·</span>
      <span class="topbar-date">${fiscalQ()} · ${todayShort()}</span>
    </div>
    <div class="topbar-right">
      <div class="notif-wrap"><span class="notif-icon">🔔</span><span class="notif-badge">3</span></div>
      <div class="topbar-avatar">WH</div>
    </div>
  </header>`;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('topbar').classList.toggle('sidebar-collapsed');
  document.querySelector('.main').classList.toggle('sidebar-collapsed');
}

function renderChatWidget(ctx) {
  const suggs = {
    index:   ["Which accounts need CRO attention this week?","What's our biggest revenue risk right now?","Where should Walt focus in Day 61–90?"],
    revenue: ["Which at-risk deals can we still save this quarter?","What's driving NRR compression to 106%?","Where does our pipeline have the biggest conversion gaps?"],
    growth:  ["Which owner accounts should we prioritize in Q3?","What's the fastest international expansion opportunity?","Break down the Procore Pay displacement opportunity"],
    market:  ["How do we counter Autodesk's BIM relationship advantage?","What's our win rate by persona vs. Autodesk?","What are the most common reasons we lose deals?"],
    gtm:     ["How much selling time does Databook recover per rep?","What's the ROI case for Databook at Procore?","How does our S&M efficiency compare to peers?"]
  };
  const s = suggs[ctx] || suggs.index;
  return `<div class="chat-widget" id="chatWidget">
    <div class="chat-header">
      <div class="chat-header-left">
        <svg width="18" height="18" viewBox="0 0 24 24"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="#7C3AED"/></svg>
        <div><div class="chat-title">Databook AI</div><div class="chat-subtitle">Strategic Intelligence · Powered by Anthropic</div></div>
      </div>
      <button class="chat-close" onclick="toggleChat()">✕</button>
    </div>
    <div class="chat-messages" id="chatMessages">
      <div class="chat-msg assistant"><div class="chat-bubble">Intelligence ready. Full context on Procore's financials, competitive dynamics, and Walt Hearn's top priorities.</div></div>
      <div class="chat-suggestions">${s.map(q=>`<button class="chat-sugg" onclick="sendSuggestion('${q.replace(/'/g,"\\'")}')">${q}</button>`).join('')}</div>
    </div>
    <div class="chat-input-row">
      <input type="text" id="chatInput" class="chat-input" placeholder="Ask about Procore, deals, strategy..." onkeydown="if(event.key==='Enter')sendChat()">
      <button class="chat-send" onclick="sendChat()">↑</button>
    </div>
  </div>
  <button class="chat-fab" id="chatFab" onclick="toggleChat()">
    <svg width="14" height="14" viewBox="0 0 24 24"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="white"/></svg>
    Databook AI
  </button>`;
}

let chatHistory=[], chatOpen=false;
function toggleChat(){chatOpen=!chatOpen;document.getElementById('chatWidget').classList.toggle('open',chatOpen);document.getElementById('chatFab').classList.toggle('hidden',chatOpen);}
function sendSuggestion(t){document.getElementById('chatInput').value=t;sendChat();}

// Central API caller — valid model string + real error surfacing.
// Current models (May 2026): claude-opus-4-8, claude-opus-4-7, claude-opus-4-6,
// claude-sonnet-4-6, claude-haiku-4-5-20251001. Change CLAUDE_MODEL to switch.
const CLAUDE_MODEL = 'claude-sonnet-4-6';
async function callClaude(messages, maxTokens){
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'x-api-key':ANTHROPIC_API_KEY,
      'anthropic-version':'2023-06-01',
      'anthropic-dangerous-direct-browser-access':'true'
    },
    body:JSON.stringify({ model:CLAUDE_MODEL, max_tokens:maxTokens, system:SYSTEM_PROMPT, messages })
  });
  const data = await res.json();
  if(!res.ok){
    const msg = (data && data.error && data.error.message) ? data.error.message : ('HTTP '+res.status);
    throw new Error(msg);
  }
  const block = (data.content||[]).find(b=>b.type==='text');
  return block ? block.text : 'The model returned no text content.';
}

async function sendChat(){
  const input=document.getElementById('chatInput'),msgs=document.getElementById('chatMessages'),text=input.value.trim();
  if(!text)return; input.value='';
  msgs.innerHTML+=`<div class="chat-msg user"><div class="chat-bubble">${esc(text)}</div></div>`;
  chatHistory.push({role:'user',content:text});
  const tid='t'+Date.now();
  msgs.innerHTML+=`<div class="chat-msg assistant" id="${tid}"><div class="chat-bubble chat-typing"><span></span><span></span><span></span></div></div>`;
  msgs.scrollTop=msgs.scrollHeight;
  try {
    if(ANTHROPIC_API_KEY==='your-api-key-here'){
      await new Promise(r=>setTimeout(r,700));
      document.getElementById(tid).outerHTML=`<div class="chat-msg assistant"><div class="chat-bubble" style="color:var(--purple);">Add your Anthropic API key at the top of shared.js to enable live intelligence.</div></div>`;
    } else {
      const reply = await callClaude(chatHistory, 600);
      chatHistory.push({role:'assistant',content:reply});
      document.getElementById(tid).outerHTML=`<div class="chat-msg assistant"><div class="chat-bubble">${fmt(reply)}</div></div>`;
    }
  } catch(e){
    document.getElementById(tid).outerHTML=`<div class="chat-msg assistant"><div class="chat-bubble" style="color:var(--danger);">API error: ${esc(e.message||'request failed')}</div></div>`;
  }
  msgs.scrollTop=msgs.scrollHeight;
}

async function generateInsight(btn,prompt){
  const panel=btn.closest('.insight-panel'),content=panel.querySelector('.insight-content');
  btn.disabled=true; btn.textContent='Generating…'; content.classList.add('visible'); content.innerHTML='<p style="color:var(--text-3);">Generating intelligence…</p>';
  try {
    if(ANTHROPIC_API_KEY==='your-api-key-here'){
      await new Promise(r=>setTimeout(r,600));
      content.innerHTML='<p style="color:var(--purple);">Add your Anthropic API key at the top of shared.js to enable live Databook intelligence.</p>';
    } else {
      const reply = await callClaude([{role:'user',content:prompt}], 700);
      content.innerHTML=fmt(reply);
    }
  } catch(e){
    content.innerHTML='<p style="color:var(--danger);">API error: '+esc(e.message||'request failed')+'</p><p style="color:var(--text-3);font-size:12px;">Verify the key is valid and has credit, and that the model string in shared.js is current.</p>';
  }
  btn.disabled=false; btn.textContent='Regenerate';
}

function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function fmt(t){return '<p>'+t.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>')+'</p>';}

const SHARED_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
:root {
  --bg:#F4F5F7; --surface:#FFFFFF; --surface-2:#F9FAFB; --surface-3:#F3F4F6;
  --sidebar-bg:#1A1A2E;
  --purple:#7C3AED; --purple-light:#EDE9FE; --purple-mid:#C4B5FD; --purple-dark:#5B21B6;
  --text:#111827; --text-2:#374151; --text-3:#6B7280; --text-4:#9CA3AF;
  --border:#E5E7EB; --border-2:#D1D5DB;
  --success:#059669; --success-bg:#ECFDF5; --success-border:#6EE7B7;
  --danger:#DC2626; --danger-bg:#FEF2F2; --danger-border:#FECACA;
  --warning:#D97706; --warning-bg:#FFFBEB; --warning-border:#FDE68A;
  --blue:#2563EB; --blue-bg:#EFF6FF; --blue-border:#93C5FD;
  --shadow-sm:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);
  --shadow:0 4px 6px -1px rgba(0,0,0,0.07),0 2px 4px -1px rgba(0,0,0,0.04);
  --shadow-lg:0 10px 15px -3px rgba(0,0,0,0.08),0 4px 6px -2px rgba(0,0,0,0.04);
  --sidebar-w:224px; --header-h:58px; --radius:10px; --radius-sm:6px;
  --font:'Inter',system-ui,sans-serif; --mono:'JetBrains Mono',monospace;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:var(--font);font-size:14px;line-height:1.5;}

/* SIDEBAR */
.sidebar{position:fixed;left:0;top:0;bottom:0;width:var(--sidebar-w);background:var(--sidebar-bg);display:flex;flex-direction:column;z-index:100;transition:transform .25s ease;}
.sidebar.collapsed{transform:translateX(-224px);}
.sidebar-brand{padding:20px 18px 14px;border-bottom:1px solid rgba(255,255,255,0.07);}
.brand-logo{display:flex;align-items:center;gap:8px;margin-bottom:3px;}
.brand-name{font-size:16px;font-weight:700;color:#FFF;letter-spacing:-.3px;}
.brand-sub{font-size:10px;color:#6B7280;padding-left:28px;}
.nav-section-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:#4B5563;padding:14px 18px 6px;}
.nav-list{list-style:none;padding:0 10px;flex:1;overflow-y:auto;}
.nav-item{margin-bottom:2px;}
.nav-link{display:flex;align-items:center;padding:8px 10px;border-radius:6px;color:#9CA3AF;text-decoration:none;font-size:12.5px;font-weight:500;transition:all .15s;}
.nav-link:hover{background:rgba(255,255,255,0.06);color:#E5E7EB;}
.nav-item.active .nav-link{background:rgba(124,58,237,0.25);color:#FFF;font-weight:600;}
.nav-item.active .nav-link::before{content:'';display:inline-block;width:3px;height:3px;border-radius:50%;background:var(--purple);margin-right:8px;}
.sidebar-footer{padding:14px 18px;border-top:1px solid rgba(255,255,255,0.07);}
.sidebar-user{display:flex;align-items:center;gap:9px;margin-bottom:11px;}
.user-avatar{width:30px;height:30px;border-radius:50%;background:var(--purple);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;}
.user-name{font-size:12.5px;font-weight:600;color:#F9FAFB;}
.user-role{font-size:10px;color:#6B7280;}
.chat-toggle-btn{width:100%;padding:7px 12px;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.35);color:#C4B5FD;border-radius:6px;cursor:pointer;font-family:var(--font);font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .15s;}
.chat-toggle-btn:hover{background:rgba(124,58,237,0.35);color:#EDE9FE;}

/* TOPBAR */
.topbar{position:fixed;left:var(--sidebar-w);top:0;right:0;height:var(--header-h);background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 24px;z-index:50;transition:left .25s ease;}
.topbar.sidebar-collapsed{left:0;}
.topbar-left{display:flex;align-items:center;gap:12px;}
.sidebar-toggle{background:none;border:none;color:var(--text-3);font-size:17px;cursor:pointer;padding:4px 6px;border-radius:4px;transition:all .15s;}
.sidebar-toggle:hover{background:var(--bg);color:var(--text);}
.topbar-title{font-size:15px;font-weight:700;color:var(--text);letter-spacing:-.2px;}
.topbar-sub{font-size:11px;color:var(--purple);margin-top:1px;font-style:italic;}
.topbar-center{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-3);}
.topbar-company{color:var(--text-2);font-weight:600;}
.topbar-dot{color:var(--text-4);}
.topbar-right{display:flex;align-items:center;gap:12px;}
.notif-wrap{position:relative;cursor:pointer;font-size:15px;}
.notif-badge{position:absolute;top:-4px;right:-5px;background:var(--danger);color:#fff;font-size:8px;font-weight:700;width:13px;height:13px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
.topbar-avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--purple-dark));color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;}

/* MAIN */
.main{margin-left:var(--sidebar-w);margin-top:var(--header-h);padding:24px 28px;min-height:calc(100vh - var(--header-h));transition:margin-left .25s ease;}
.main.sidebar-collapsed{margin-left:0;}

/* CARDS */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;box-shadow:var(--shadow-sm);}
.card-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.7px;color:var(--text-3);margin-bottom:12px;}

/* KPI */
.kpi-grid{display:grid;gap:14px;margin-bottom:20px;}
.kpi-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;box-shadow:var(--shadow-sm);transition:box-shadow .15s,border-color .15s;}
.kpi-card:hover{box-shadow:var(--shadow);border-color:var(--border-2);}
.kpi-label{font-size:12px;font-weight:500;color:var(--text-3);margin-bottom:7px;}
.kpi-value{font-size:28px;font-weight:700;color:var(--text);letter-spacing:-1px;line-height:1.1;}
.kpi-meta{display:flex;align-items:center;gap:8px;margin-top:7px;flex-wrap:wrap;}
.kpi-trend{font-size:12px;font-weight:600;}
.kpi-trend.up{color:var(--success);}
.kpi-trend.down{color:var(--danger);}
.kpi-trend.flat{color:var(--warning);}
.kpi-sub{font-size:11px;color:var(--text-4);margin-top:4px;}
.kpi-sparkbar{display:flex;align-items:flex-end;gap:3px;height:32px;margin-top:8px;}
.kpi-bar{background:var(--purple-light);border-radius:2px;flex:1;}
.kpi-bar.last{background:var(--purple);}

/* TAGS */
.tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:11.5px;font-weight:500;border:1px solid;white-space:nowrap;}
.tag-red{background:#FFF5F5;border-color:#FEB2B2;color:#C53030;}
.tag-coral{background:#FFF5F3;border-color:#FDB09A;color:#C53030;}
.tag-orange{background:#FFFAF0;border-color:#FBD38D;color:#C05621;}
.tag-amber{background:#FFFBEB;border-color:var(--warning-border);color:#92400E;}
.tag-purple{background:var(--purple-light);border-color:var(--purple-mid);color:var(--purple);}
.tag-green{background:var(--success-bg);border-color:var(--success-border);color:var(--success);}
.tag-blue{background:var(--blue-bg);border-color:var(--blue-border);color:var(--blue);}
.tag-gray{background:var(--surface-2);border-color:var(--border-2);color:var(--text-3);}

/* BADGES */
.db-badge{display:inline-flex;align-items:center;gap:3px;background:var(--purple-light);color:var(--purple);font-size:9.5px;font-weight:700;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.4px;}
.db-badge::before{content:'⬡';font-size:8px;}
.crm-badge{display:inline-flex;align-items:center;background:var(--surface-2);color:var(--text-3);font-size:9.5px;font-weight:700;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.4px;border:1px solid var(--border);}

/* STATUS */
.status-dot{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;}
.status-dot::before{content:'';width:7px;height:7px;border-radius:50%;}
.status-dot.critical::before{background:var(--danger);}
.status-dot.at-risk::before{background:var(--warning);}
.status-dot.healthy::before{background:var(--success);}
.status-dot.critical{color:var(--danger);}
.status-dot.at-risk{color:var(--warning);}
.status-dot.healthy{color:var(--success);}

/* TABLES */
.data-table{width:100%;border-collapse:collapse;}
.data-table th{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--text-3);padding:8px 12px;text-align:left;border-bottom:1px solid var(--border);background:var(--surface-2);}
.data-table td{padding:11px 12px;font-size:13px;border-bottom:1px solid var(--border);vertical-align:middle;}
.data-table tr:last-child td{border-bottom:none;}
.data-table tbody tr:hover td{background:#FAFAFA;}

/* INSIGHT PANEL */
.insight-panel{background:linear-gradient(135deg,#F5F3FF,#EDE9FE);border:1px solid var(--purple-mid);border-radius:var(--radius);padding:20px;margin-top:20px;}
.insight-panel-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.insight-panel-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--purple);display:flex;align-items:center;gap:7px;}
.insight-generate-btn{background:var(--purple);color:#fff;border:none;border-radius:6px;padding:8px 16px;font-family:var(--font);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;}
.insight-generate-btn:hover{background:var(--purple-dark);}
.insight-generate-btn:disabled{opacity:.55;cursor:not-allowed;}
.insight-content{font-size:13px;line-height:1.7;color:var(--text-2);display:none;}
.insight-content.visible{display:block;}
.insight-content p{margin-bottom:8px;}
.insight-content strong{color:var(--text);}

/* CHAT */
.chat-fab{position:fixed;bottom:22px;right:22px;background:var(--purple);color:#fff;border:none;border-radius:24px;padding:11px 18px;font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:7px;box-shadow:0 8px 20px rgba(124,58,237,0.35);z-index:200;transition:all .2s;}
.chat-fab:hover{background:var(--purple-dark);transform:translateY(-1px);}
.chat-fab.hidden{display:none;}
.chat-widget{position:fixed;bottom:22px;right:22px;width:370px;height:520px;background:var(--surface);border:1px solid var(--border);border-radius:14px;display:none;flex-direction:column;z-index:200;box-shadow:var(--shadow-lg);overflow:hidden;}
.chat-widget.open{display:flex;}
.chat-header{padding:14px 18px;background:linear-gradient(135deg,#F5F3FF,#EDE9FE);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.chat-header-left{display:flex;align-items:center;gap:9px;}
.chat-title{font-size:13px;font-weight:700;color:var(--text);}
.chat-subtitle{font-size:10px;color:var(--text-3);}
.chat-close{background:none;border:none;color:var(--text-3);font-size:14px;cursor:pointer;padding:3px;}
.chat-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;}
.chat-msg.user{display:flex;justify-content:flex-end;}
.chat-msg.assistant{display:flex;justify-content:flex-start;}
.chat-bubble{max-width:84%;padding:9px 13px;border-radius:10px;font-size:12.5px;line-height:1.5;}
.chat-msg.assistant .chat-bubble{background:var(--surface-2);color:var(--text-2);border:1px solid var(--border);border-radius:3px 10px 10px 10px;}
.chat-msg.user .chat-bubble{background:var(--purple);color:#fff;border-radius:10px 3px 10px 10px;}
.chat-suggestions{display:flex;flex-direction:column;gap:5px;margin-top:4px;}
.chat-sugg{background:var(--surface);border:1px solid var(--border);color:var(--text-2);border-radius:7px;padding:7px 11px;font-size:11.5px;font-family:var(--font);cursor:pointer;text-align:left;transition:all .12s;}
.chat-sugg:hover{border-color:var(--purple);color:var(--purple);background:var(--purple-light);}
.chat-input-row{padding:10px 14px;border-top:1px solid var(--border);display:flex;gap:7px;}
.chat-input{flex:1;background:var(--surface-2);border:1px solid var(--border);border-radius:7px;padding:8px 12px;color:var(--text);font-family:var(--font);font-size:12.5px;outline:none;transition:border-color .15s;}
.chat-input:focus{border-color:var(--purple);}
.chat-send{background:var(--purple);color:#fff;border:none;border-radius:7px;width:33px;height:33px;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.chat-send:hover{background:var(--purple-dark);}
.chat-typing{display:flex;gap:4px;align-items:center;}
.chat-typing span{width:5px;height:5px;background:var(--purple);border-radius:50%;animation:typing 1.2s ease infinite;}
.chat-typing span:nth-child(2){animation-delay:.2s;}
.chat-typing span:nth-child(3){animation-delay:.4s;}
@keyframes typing{0%,60%,100%{transform:translateY(0);opacity:.4;}30%{transform:translateY(-5px);opacity:1;}}

/* LAYOUT */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
.grid-5{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;}
.grid-6{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;}
.col-2{grid-column:span 2;}
.col-3{grid-column:span 3;}
.mb-16{margin-bottom:16px;}
.mb-20{margin-bottom:20px;}
.section-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;}
.section-title{font-size:14px;font-weight:700;color:var(--text);letter-spacing:-.2px;}
.section-sub{font-size:12px;color:var(--text-3);margin-top:2px;}
.prog-wrap{height:5px;background:var(--bg);border-radius:3px;overflow:hidden;}
.prog-fill{height:100%;border-radius:3px;}
.prog-purple{background:var(--purple);}
.prog-success{background:var(--success);}
.prog-warning{background:var(--warning);}
.prog-danger{background:var(--danger);}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:3px;}
canvas{max-width:100%;}
.mono{font-family:var(--mono);}
.fw-600{font-weight:600;}
.fw-700{font-weight:700;}
.text-purple{color:var(--purple);}
.text-success{color:var(--success);}
.text-danger{color:var(--danger);}
.text-warning{color:var(--warning);}
.text-muted{color:var(--text-3);}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
.fi{animation:fadeUp .35s ease forwards;}
.d1{animation-delay:.05s;opacity:0;}
.d2{animation-delay:.10s;opacity:0;}
.d3{animation-delay:.15s;opacity:0;}
.d4{animation-delay:.20s;opacity:0;}
.d5{animation-delay:.25s;opacity:0;}

/* CHART WRAPPER — prevents Chart.js infinite-growth loop */
.chart-wrap{position:relative;width:100%;}
`;
