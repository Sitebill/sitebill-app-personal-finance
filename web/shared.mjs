// Shared UI of the Personal Finance app. Plain ESM, no build step: Vue comes from the host.
// Own CSS is injected once (Tailwind in the host only knows the classes used by the platform itself),
// and it is built on the host's theme variables so it follows light/dark mode automatically.
const { defineComponent, h, ref, computed, onMounted, onBeforeUnmount } = globalThis.__SB_HOST__.vue

const e = (tag, props, ...kids) => {
  const list = kids.flat(Infinity).filter(k => k !== null && k !== undefined && k !== false)
  // components get their children as a default slot
  return typeof tag === 'object' ? h(tag, props, { default: () => list }) : h(tag, props, list)
}

// ---------------------------------------------------------------- styles
const CSS = `
.pf{--pf-bg:var(--ui-bg,#fff);--pf-card:var(--ui-bg-elevated,var(--ui-bg,#fff));--pf-line:var(--ui-border,#e5e7eb);--pf-text:var(--ui-text,#111827);--pf-muted:var(--ui-text-muted,#6b7280);--pf-brand:#6366f1;--pf-brand2:#8b5cf6;--pf-in:#10b981;--pf-out:#f97316;--pf-bad:#ef4444;--pf-warn:#f59e0b;
  color:var(--pf-text);max-width:1120px;margin:0 auto;padding:8px 0 40px;font-size:14px;line-height:1.5}
.pf *{box-sizing:border-box}
.pf h1,.pf h2,.pf h3,.pf p{margin:0}
.pf-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}
.pf-title{font-size:26px;font-weight:700;letter-spacing:-.02em}
.pf-sub{color:var(--pf-muted)}
.pf-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.pf-grid{display:grid;gap:16px}
.pf-g3{grid-template-columns:repeat(3,minmax(0,1fr))}
.pf-g2{grid-template-columns:repeat(2,minmax(0,1fr))}
.pf-main{grid-template-columns:minmax(0,1.15fr) minmax(0,1fr)}
@media(max-width:860px){.pf-g3,.pf-g2,.pf-main{grid-template-columns:minmax(0,1fr)}}
.pf-card{background:var(--pf-card);border:1px solid var(--pf-line);border-radius:18px;padding:18px 20px}
.pf-card h2{font-size:15px;font-weight:650;margin-bottom:14px}
.pf-hero{position:relative;overflow:hidden;border:0;color:#fff;background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#c026d3 100%);padding:26px 28px;border-radius:22px;box-shadow:0 18px 40px -18px rgba(99,102,241,.7)}
.pf-hero:after{content:"";position:absolute;right:-60px;top:-70px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.12)}
.pf-hero:before{content:"";position:absolute;right:70px;bottom:-90px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.08)}
.pf-hero small{opacity:.8;font-size:13px}
.pf-hero .pf-big{font-size:42px;font-weight:750;letter-spacing:-.03em;line-height:1.1;margin:4px 0 14px}
.pf-chips{display:flex;gap:8px;flex-wrap:wrap;position:relative;z-index:1}
.pf-acc{background:rgba(255,255,255,.16);border-radius:12px;padding:6px 12px;font-size:12.5px;backdrop-filter:blur(4px)}
.pf-acc b{display:block;font-size:14px}
.pf-stat{display:flex;flex-direction:column;gap:2px}
.pf-stat .k{color:var(--pf-muted);font-size:12.5px;display:flex;align-items:center;gap:6px}
.pf-stat .v{font-size:24px;font-weight:700;letter-spacing:-.02em}
.pf-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.pf-in{color:var(--pf-in)}.pf-out{color:var(--pf-out)}.pf-bad{color:var(--pf-bad)}
.pf-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--pf-line);background:var(--pf-card);color:var(--pf-text);border-radius:12px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer;transition:.15s}
.pf-btn:hover{border-color:var(--pf-brand)}
.pf-btn.primary{background:linear-gradient(135deg,var(--pf-brand),var(--pf-brand2));border-color:transparent;color:#fff;box-shadow:0 8px 18px -8px rgba(99,102,241,.8)}
.pf-btn.primary:hover{filter:brightness(1.07)}
.pf-btn.danger:hover{border-color:var(--pf-bad);color:var(--pf-bad)}
.pf-btn.sm{padding:4px 10px;font-size:12.5px;border-radius:9px}
.pf-btn:disabled{opacity:.55;cursor:default}
.pf-month{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--pf-line);border-radius:12px;padding:3px;background:var(--pf-card)}
.pf-month button{border:0;background:none;color:var(--pf-text);width:30px;height:30px;border-radius:9px;cursor:pointer;font-size:16px}
.pf-month button:hover{background:var(--pf-line)}
.pf-month span{min-width:130px;text-align:center;font-weight:650;text-transform:capitalize}
.pf-donut{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
.pf-legend{flex:1;min-width:190px;display:flex;flex-direction:column;gap:7px}
.pf-legend div{display:flex;align-items:center;gap:8px;font-size:13px}
.pf-legend span.n{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pf-legend span.p{color:var(--pf-muted);font-variant-numeric:tabular-nums}
.pf-bars{display:flex;align-items:flex-end;gap:12px;height:170px;padding-top:6px}
.pf-bargrp{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end}
.pf-bargrp .pair{display:flex;align-items:flex-end;gap:4px;height:100%;width:100%;justify-content:center}
.pf-bar{width:36%;max-width:22px;border-radius:7px 7px 3px 3px;min-height:3px;transition:height .4s}
.pf-bargrp small{color:var(--pf-muted);font-size:12px;text-transform:capitalize}
.pf-bargrp.cur small{color:var(--pf-text);font-weight:700}
.pf-bud{display:flex;flex-direction:column;gap:14px}
.pf-bud .t{display:flex;justify-content:space-between;gap:8px;margin-bottom:5px;font-size:13px}
.pf-bud .t span:last-child{color:var(--pf-muted);font-variant-numeric:tabular-nums}
.pf-track{height:9px;border-radius:99px;background:var(--pf-line);overflow:hidden}
.pf-fill{height:100%;border-radius:99px;transition:width .5s}
.pf-list{display:flex;flex-direction:column}
.pf-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--pf-line)}
.pf-item:first-child{border-top:0}
.pf-ico{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-size:18px;flex:none}
.pf-item .m{flex:1;min-width:0}
.pf-item .m b{display:block;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pf-item .m span{color:var(--pf-muted);font-size:12.5px}
.pf-amt{font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
.pf-empty{text-align:center;padding:34px 12px;color:var(--pf-muted)}
.pf-empty .big{font-size:40px;margin-bottom:6px}
.pf-empty h3{color:var(--pf-text);font-size:17px;margin-bottom:6px}
.pf-empty p{max-width:420px;margin:0 auto 16px}
.pf-input,.pf-select{width:100%;border:1px solid var(--pf-line);background:var(--pf-bg);color:var(--pf-text);border-radius:11px;padding:9px 12px;font:inherit}
.pf-input:focus,.pf-select:focus{outline:2px solid var(--pf-brand);outline-offset:-1px}
.pf-label{display:flex;flex-direction:column;gap:5px;font-size:12.5px;color:var(--pf-muted);font-weight:600}
.pf-seg{display:grid;grid-template-columns:1fr 1fr;gap:4px;background:var(--pf-line);padding:4px;border-radius:13px}
.pf-seg button{border:0;background:none;color:var(--pf-text);padding:8px;border-radius:10px;font:inherit;font-weight:650;cursor:pointer}
.pf-seg button.on{background:var(--pf-card);box-shadow:0 1px 4px rgba(0,0,0,.15)}
.pf-seg button.on.in{color:var(--pf-in)}.pf-seg button.on.out{color:var(--pf-out)}
.pf-ov{position:fixed;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(3px);display:grid;place-items:center;z-index:200;padding:16px}
.pf-modal{width:100%;max-width:440px;background:var(--pf-card);border:1px solid var(--pf-line);border-radius:20px;padding:22px;display:flex;flex-direction:column;gap:14px;box-shadow:0 30px 80px -20px rgba(0,0,0,.5);max-height:92vh;overflow:auto}
.pf-modal h2{font-size:18px;margin:0}
.pf-form{display:flex;flex-direction:column;gap:14px}
.pf-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pf-filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.pf-filters .pf-input,.pf-filters .pf-select{width:auto;min-width:150px}
.pf-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.pf-tile{display:flex;flex-direction:column;gap:12px}
.pf-tile .top{display:flex;align-items:center;gap:12px}
.pf-tile .top b{font-size:15px}
.pf-tile .bal{font-size:24px;font-weight:700;letter-spacing:-.02em}
.pf-tile .act{display:flex;gap:8px;margin-top:auto}
.pf-sw{display:flex;gap:6px;flex-wrap:wrap}
.pf-sw i{width:24px;height:24px;border-radius:50%;cursor:pointer;border:3px solid transparent;display:block}
.pf-sw i.on{border-color:var(--pf-text)}
.pf-deny{padding:60px 16px;text-align:center;color:var(--pf-muted)}
.pf-landing{padding:0 0 30px}
.pf-lhero{position:relative;overflow:hidden;border-radius:30px;padding:64px 40px;color:#fff;background:radial-gradient(1200px 500px at 85% -10%,rgba(236,72,153,.55),transparent 60%),radial-gradient(900px 500px at 0% 110%,rgba(56,189,248,.35),transparent 60%),linear-gradient(135deg,#312e81,#5b21b6 60%,#86198f);display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:36px;align-items:center}
@media(max-width:860px){.pf-lhero{grid-template-columns:minmax(0,1fr);padding:40px 22px}}
.pf-lhero h1{font-size:clamp(34px,5vw,54px);line-height:1.05;letter-spacing:-.035em;font-weight:800;margin-bottom:16px}
.pf-lhero p{font-size:17px;opacity:.88;max-width:520px;margin-bottom:26px}
.pf-cta{display:inline-flex;gap:8px;align-items:center;background:#fff;color:#4c1d95;font-weight:700;font-size:16px;padding:14px 26px;border-radius:15px;text-decoration:none;box-shadow:0 14px 30px -12px rgba(0,0,0,.5);transition:.15s}
.pf-cta:hover{transform:translateY(-2px)}
.pf-mock{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:22px;padding:20px;backdrop-filter:blur(8px);display:flex;flex-direction:column;gap:14px;transform:rotate(1.5deg)}
.pf-mock .row{display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.12);border-radius:13px;padding:10px 14px;font-size:14px}
.pf-mock .big{font-size:34px;font-weight:800;letter-spacing:-.03em}
.pf-feat{margin-top:22px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
@media(max-width:860px){.pf-feat{grid-template-columns:minmax(0,1fr)}}
.pf-feat .pf-card{padding:24px}
.pf-feat .ic{font-size:30px;margin-bottom:10px}
.pf-feat h3{font-size:17px;margin-bottom:6px}
.pf-feat p{color:var(--pf-muted)}
.pf-mini{display:flex;flex-direction:column;gap:12px}
.pf-mini .big{font-size:28px;font-weight:750;letter-spacing:-.02em}
.pf-loading{padding:60px;text-align:center;color:var(--pf-muted)}
`

let cssDone = false
function injectCss() {
  if (cssDone || typeof document === 'undefined') return
  cssDone = true
  const s = document.createElement('style')
  s.id = 'pf-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

// ---------------------------------------------------------------- helpers
const CURRENCY = { ru: 'RUB', en: 'USD', sr: 'RSD', tg: 'TJS' }
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#ec4899', '#8b5cf6', '#14b8a6']
const ICONS = ['🛒', '🏠', '🚌', '🎬', '💊', '☕', '📚', '✈️', '🎁', '💼', '🧩', '🏷️', '👕', '🐶', '📱', '💡']

// host.locale is a Vue ref (see AppHost in @sitebill/app-sdk); read the string from it
const loc = host => String((host.locale && typeof host.locale === 'object' ? host.locale.value : host.locale) || 'en')

export function money(host, n, opts = {}) {
  const code = CURRENCY[loc(host).slice(0, 2)] || 'USD'
  try {
    return new Intl.NumberFormat(loc(host), { style: 'currency', currency: code, maximumFractionDigits: opts.cents ? 2 : 0 }).format(n)
  } catch {
    return `${Math.round(n)} ${code}`
  }
}
const ymOf = d => String(d).slice(0, 7)
const pad = n => String(n).padStart(2, '0')
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
const curYm = () => todayStr().slice(0, 7)
const shiftYm = (ym, delta) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + delta, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}` }
const monthName = (host, ym, style = 'long') => { const [y, m] = ym.split('-').map(Number); return new Intl.DateTimeFormat(loc(host), style === 'long' ? { month: 'long', year: 'numeric' } : { month: 'short' }).format(new Date(y, m - 1, 1)) }
const dayLabel = (host, iso) => { const [y, m, d] = iso.split('-').map(Number); return new Intl.DateTimeFormat(loc(host), { day: 'numeric', month: 'short' }).format(new Date(y, m - 1, d)) }
const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0)

const Q = {
  accounts: 'query { financeAccounts { id name kind opening_balance color } }',
  categories: 'query { financeCategories { id name kind icon color monthly_limit } }',
  txs: 'query { financeTransactions(limit: 10000) { id account_id category_id kind amount occurred_on note } }',
  saveTx: 'mutation($id: ID, $account_id: Int!, $category_id: Int, $kind: String!, $amount: Float!, $occurred_on: String!, $note: String) { financeSaveTransaction(id: $id, account_id: $account_id, category_id: $category_id, kind: $kind, amount: $amount, occurred_on: $occurred_on, note: $note) { id } }',
  delTx: 'mutation($id: ID!) { financeDeleteTransaction(id: $id) }',
  saveAcc: 'mutation($id: ID, $name: String!, $kind: String!, $opening_balance: Float, $color: String) { financeSaveAccount(id: $id, name: $name, kind: $kind, opening_balance: $opening_balance, color: $color) { id } }',
  delAcc: 'mutation($id: ID!) { financeDeleteAccount(id: $id) }',
  saveCat: 'mutation($id: ID, $name: String!, $kind: String!, $icon: String, $color: String, $monthly_limit: Float) { financeSaveCategory(id: $id, name: $name, kind: $kind, icon: $icon, color: $color, monthly_limit: $monthly_limit) { id } }',
  delCat: 'mutation($id: ID!) { financeDeleteCategory(id: $id) }',
  seed: 'mutation($locale: String) { financeSeedDemo(locale: $locale) }',
}

// ---------------------------------------------------------------- ledger store (one per page)
export function useLedger(host) {
  injectCss()
  const accounts = ref([])
  const categories = ref([])
  const txs = ref([])
  const loading = ref(true)
  const denied = ref(false)

  async function reload() {
    try {
      const [a, c, t] = await Promise.all([host.gql(Q.accounts), host.gql(Q.categories), host.gql(Q.txs)])
      accounts.value = a.financeAccounts
      categories.value = c.financeCategories
      txs.value = t.financeTransactions
      denied.value = false
    } catch {
      denied.value = true
    } finally {
      loading.value = false
    }
  }
  onMounted(reload)

  const catById = computed(() => new Map(categories.value.map(c => [Number(c.id), c])))
  const accById = computed(() => new Map(accounts.value.map(a => [Number(a.id), a])))
  const balances = computed(() => accounts.value.map(a => {
    const own = txs.value.filter(t => t.account_id === Number(a.id))
    return { ...a, balance: a.opening_balance + sum(own.filter(t => t.kind === 'income'), t => t.amount) - sum(own.filter(t => t.kind === 'expense'), t => t.amount) }
  }))
  const total = computed(() => sum(balances.value, a => a.balance))
  const isEmpty = computed(() => !accounts.value.length && !txs.value.length)

  const run = async (query, vars, okKey = 'saved') => {
    try {
      await host.gql(query, vars)
      if (okKey) host.toast(host.t(okKey), 'success')
      await reload()
      return true
    } catch (err) {
      host.toast(String(err?.message || host.t('error')), 'error')
      return false
    }
  }
  const seed = async () => run(Q.seed, { locale: loc(host).slice(0, 2) }, 'demo_loaded')

  return { accounts, categories, txs, loading, denied, reload, catById, accById, balances, total, isEmpty, run, seed }
}

// ---------------------------------------------------------------- small views
const Modal = defineComponent({
  name: 'PfModal',
  props: { title: String, onClose: Function },
  setup(props, { slots }) {
    const onKey = ev => { if (ev.key === 'Escape') props.onClose?.() }
    onMounted(() => document.addEventListener('keydown', onKey))
    onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
    return () => e('div', { class: 'pf pf-ov', style: 'max-width:none;padding:16px', onClick: ev => { if (ev.target === ev.currentTarget) props.onClose?.() } },
      e('div', { class: 'pf-modal' }, e('h2', null, props.title), slots.default?.()))
  },
})

const Empty = (host, ledger) => e('div', { class: 'pf-card pf-empty' },
  e('div', { class: 'big' }, '🌱'), e('h3', null, host.t('empty_ledger')), e('p', null, host.t('demo_text')),
  e('button', { class: 'pf-btn primary', onClick: () => ledger.seed() }, '✨ ' + host.t('demo_button')))

const Swatches = (value, set, list = COLORS) => e('div', { class: 'pf-sw' }, list.map(c =>
  e('i', { key: c, style: `background:${c}`, class: value === c ? 'on' : '', onClick: () => set(c) })))

// ---------------------------------------------------------------- transaction form
export const TxModal = defineComponent({
  name: 'PfTxModal',
  props: { host: Object, ledger: Object, tx: { type: Object, default: null }, onClose: Function },
  setup(props) {
    const { host, ledger } = props
    const t = props.tx
    const kind = ref(t?.kind || 'expense')
    const amount = ref(t ? String(t.amount) : '')
    const date = ref(t?.occurred_on || todayStr())
    const account = ref(t ? String(t.account_id) : String(ledger.accounts.value[0]?.id || ''))
    const category = ref(t?.category_id ? String(t.category_id) : '')
    const note = ref(t?.note || '')
    const busy = ref(false)
    const cats = computed(() => ledger.categories.value.filter(c => c.kind === kind.value))

    async function submit(ev) {
      ev.preventDefault()
      busy.value = true
      const ok = await ledger.run(Q.saveTx, {
        id: t?.id ?? null, account_id: Number(account.value), category_id: category.value ? Number(category.value) : null,
        kind: kind.value, amount: Number(String(amount.value).replace(',', '.')), occurred_on: date.value, note: note.value || null,
      })
      busy.value = false
      if (ok) props.onClose()
    }

    return () => e(Modal, { title: host.t(t ? 'edit' : 'add_transaction'), onClose: props.onClose },
      e('form', { class: 'pf-form', onSubmit: submit },
        e('div', { class: 'pf-seg' },
          e('button', { type: 'button', class: 'in' + (kind.value === 'income' ? ' on' : ''), onClick: () => { kind.value = 'income'; category.value = '' } }, '↓ ' + host.t('kind_income')),
          e('button', { type: 'button', class: 'out' + (kind.value === 'expense' ? ' on' : ''), onClick: () => { kind.value = 'expense'; category.value = '' } }, '↑ ' + host.t('kind_expense'))),
        e('div', { class: 'pf-two' },
          e('label', { class: 'pf-label' }, host.t('amount'), e('input', { class: 'pf-input', type: 'number', step: '0.01', min: '0.01', required: true, autofocus: true, value: amount.value, onInput: ev => { amount.value = ev.target.value } })),
          e('label', { class: 'pf-label' }, host.t('date'), e('input', { class: 'pf-input', type: 'date', required: true, value: date.value, onInput: ev => { date.value = ev.target.value } }))),
        e('div', { class: 'pf-two' },
          e('label', { class: 'pf-label' }, host.t('account'), e('select', { class: 'pf-select', required: true, value: account.value, onChange: ev => { account.value = ev.target.value } },
            ledger.accounts.value.map(a => e('option', { key: a.id, value: String(a.id), selected: String(a.id) === account.value }, a.name)))),
          e('label', { class: 'pf-label' }, host.t('category'), e('select', { class: 'pf-select', value: category.value, onChange: ev => { category.value = ev.target.value } },
            e('option', { value: '' }, host.t('uncategorized')),
            cats.value.map(c => e('option', { key: c.id, value: String(c.id), selected: String(c.id) === category.value }, `${c.icon} ${c.name}`))))),
        e('label', { class: 'pf-label' }, host.t('note'), e('input', { class: 'pf-input', maxlength: 200, value: note.value, onInput: ev => { note.value = ev.target.value } })),
        e('div', { class: 'pf-row', style: 'justify-content:flex-end' },
          e('button', { type: 'button', class: 'pf-btn', onClick: props.onClose }, host.t('cancel')),
          e('button', { type: 'submit', class: 'pf-btn primary', disabled: busy.value || !ledger.accounts.value.length }, host.t('save')))))
  },
})

// ---------------------------------------------------------------- transaction row
function txRow(host, ledger, t, actions) {
  const c = ledger.catById.value.get(t.category_id)
  const a = ledger.accById.value.get(t.account_id)
  const inc = t.kind === 'income'
  return e('div', { class: 'pf-item', key: t.id },
    e('div', { class: 'pf-ico', style: `background:${(c?.color || '#94a3b8')}22` }, c?.icon || '•'),
    e('div', { class: 'm' }, e('b', null, t.note || c?.name || host.t('uncategorized')), e('span', null, `${c?.name || host.t('uncategorized')} · ${a?.name || ''} · ${dayLabel(host, t.occurred_on)}`)),
    e('div', { class: 'pf-amt ' + (inc ? 'pf-in' : ''), }, (inc ? '+' : '−') + money(host, t.amount)),
    actions ? e('div', { class: 'pf-row', style: 'gap:6px' },
      e('button', { class: 'pf-btn sm', onClick: () => actions.edit(t) }, '✎'),
      e('button', { class: 'pf-btn sm danger', onClick: () => actions.del(t) }, '🗑')) : null)
}

function donut(host, rows, totalSpent) {
  const R = 15.9155
  let off = 25
  const segs = rows.map(r => {
    const pct = totalSpent ? (r.sum / totalSpent) * 100 : 0
    const el = h('circle', { key: r.key, cx: 21, cy: 21, r: R, fill: 'none', stroke: r.color, 'stroke-width': 5.2, 'stroke-dasharray': `${Math.max(pct - 0.6, 0.1)} ${100 - Math.max(pct - 0.6, 0.1)}`, 'stroke-dashoffset': off })
    off -= pct
    return el
  })
  return h('svg', { viewBox: '0 0 42 42', width: 170, height: 170, style: 'flex:none' }, [
    h('circle', { cx: 21, cy: 21, r: R, fill: 'none', stroke: 'var(--pf-line)', 'stroke-width': 5.2 }),
    ...segs,
    h('text', { x: 21, y: 20.2, 'text-anchor': 'middle', 'font-size': 2.9, 'font-weight': 700, fill: 'currentColor' }, money(host, totalSpent)),
    h('text', { x: 21, y: 24.6, 'text-anchor': 'middle', 'font-size': 1.9, fill: 'var(--pf-muted)' }, host.t('expense')),
  ])
}

// ---------------------------------------------------------------- overview
export const Overview = defineComponent({
  name: 'PfOverview',
  props: { host: { type: Object, required: true } },
  setup(props) {
    const { host } = props
    const ledger = useLedger(host)
    const ym = ref(curYm())
    const modal = ref(false)

    const monthTx = computed(() => ledger.txs.value.filter(t => ymOf(t.occurred_on) === ym.value))
    const income = computed(() => sum(monthTx.value.filter(t => t.kind === 'income'), t => t.amount))
    const expense = computed(() => sum(monthTx.value.filter(t => t.kind === 'expense'), t => t.amount))
    const rate = computed(() => (income.value > 0 ? Math.round(((income.value - expense.value) / income.value) * 100) : 0))

    const byCat = computed(() => {
      const m = new Map()
      for (const t of monthTx.value.filter(x => x.kind === 'expense')) m.set(t.category_id || 0, (m.get(t.category_id || 0) || 0) + t.amount)
      return [...m.entries()].map(([id, s]) => {
        const c = ledger.catById.value.get(id)
        return { key: id, name: c?.name || host.t('uncategorized'), icon: c?.icon || '•', color: c?.color || '#94a3b8', sum: s, cat: c }
      }).sort((a, b) => b.sum - a.sum)
    })
    const budgets = computed(() => ledger.categories.value.filter(c => c.kind === 'expense' && c.monthly_limit).map(c => {
      const spent = byCat.value.find(r => r.key === Number(c.id))?.sum || 0
      return { c, spent, pct: spent / c.monthly_limit }
    }).sort((a, b) => b.pct - a.pct))
    const trend = computed(() => {
      const months = [-5, -4, -3, -2, -1, 0].map(d => shiftYm(ym.value, d))
      const rows = months.map(m => {
        const list = ledger.txs.value.filter(t => ymOf(t.occurred_on) === m)
        return { m, i: sum(list.filter(t => t.kind === 'income'), t => t.amount), x: sum(list.filter(t => t.kind === 'expense'), t => t.amount) }
      })
      const max = Math.max(1, ...rows.flatMap(r => [r.i, r.x]))
      return { rows, max }
    })

    return () => {
      if (ledger.loading.value) return e('div', { class: 'pf pf-loading' }, '…')
      if (ledger.denied.value) return e('div', { class: 'pf pf-deny' }, host.t('access_denied'))
      if (ledger.isEmpty.value) return e('div', { class: 'pf' }, e('div', { class: 'pf-head' }, e('h1', { class: 'pf-title' }, host.t('overview_title'))), Empty(host, ledger))

      const spentTotal = sum(byCat.value, r => r.sum)
      return e('div', { class: 'pf' },
        e('div', { class: 'pf-head' },
          e('div', null, e('h1', { class: 'pf-title' }, host.t('overview_title')), e('p', { class: 'pf-sub' }, host.t('app_name'))),
          e('div', { class: 'pf-row' },
            e('div', { class: 'pf-month' },
              e('button', { onClick: () => { ym.value = shiftYm(ym.value, -1) } }, '‹'),
              e('span', null, monthName(host, ym.value)),
              e('button', { onClick: () => { ym.value = shiftYm(ym.value, 1) } }, '›')),
            e('button', { class: 'pf-btn primary', onClick: () => { modal.value = true } }, '＋ ' + host.t('add_transaction')))),

        e('div', { class: 'pf-card pf-hero', style: 'margin-bottom:16px' },
          e('small', null, host.t('total_balance') + ' · ' + host.t('across_accounts')),
          e('div', { class: 'pf-big' }, money(host, ledger.total.value)),
          e('div', { class: 'pf-chips' }, ledger.balances.value.map(a => e('div', { class: 'pf-acc', key: a.id }, a.name, e('b', null, money(host, a.balance)))))),

        e('div', { class: 'pf-grid pf-g3', style: 'margin-bottom:16px' },
          e('div', { class: 'pf-card pf-stat' }, e('div', { class: 'k' }, e('span', { class: 'pf-dot', style: 'background:var(--pf-in)' }), host.t('income')), e('div', { class: 'v pf-in' }, money(host, income.value))),
          e('div', { class: 'pf-card pf-stat' }, e('div', { class: 'k' }, e('span', { class: 'pf-dot', style: 'background:var(--pf-out)' }), host.t('expense')), e('div', { class: 'v pf-out' }, money(host, expense.value))),
          e('div', { class: 'pf-card pf-stat' }, e('div', { class: 'k' }, host.t('net') + ' · ' + host.t('savings_rate') + ' ' + rate.value + '%'),
            e('div', { class: 'v ' + (income.value - expense.value < 0 ? 'pf-bad' : '') }, (income.value - expense.value >= 0 ? '+' : '−') + money(host, Math.abs(income.value - expense.value))))),

        e('div', { class: 'pf-grid pf-main', style: 'margin-bottom:16px' },
          e('div', { class: 'pf-card' }, e('h2', null, host.t('chart_by_category')),
            byCat.value.length
              ? e('div', { class: 'pf-donut' }, donut(host, byCat.value, spentTotal),
                e('div', { class: 'pf-legend' }, byCat.value.slice(0, 7).map(r => e('div', { key: r.key },
                  e('span', { class: 'pf-dot', style: `background:${r.color}` }), e('span', { class: 'n' }, `${r.icon} ${r.name}`),
                  e('b', null, money(host, r.sum)), e('span', { class: 'p' }, Math.round((r.sum / spentTotal) * 100) + '%')))))
              : e('p', { class: 'pf-sub' }, host.t('no_data'))),
          e('div', { class: 'pf-card' }, e('h2', null, host.t('chart_trend')),
            e('div', { class: 'pf-bars' }, trend.value.rows.map(r => e('div', { class: 'pf-bargrp' + (r.m === ym.value ? ' cur' : ''), key: r.m },
              e('div', { class: 'pair' },
                e('div', { class: 'pf-bar', style: `height:${(r.i / trend.value.max) * 100}%;background:var(--pf-in)`, title: money(host, r.i) }),
                e('div', { class: 'pf-bar', style: `height:${(r.x / trend.value.max) * 100}%;background:var(--pf-out)`, title: money(host, r.x) })),
              e('small', null, monthName(host, r.m, 'short'))))))),

        e('div', { class: 'pf-grid pf-g2' },
          e('div', { class: 'pf-card' }, e('h2', null, host.t('budgets_title')),
            budgets.value.length
              ? e('div', { class: 'pf-bud' }, budgets.value.map(b => {
                const over = b.pct > 1
                const color = over ? 'var(--pf-bad)' : b.pct > 0.75 ? 'var(--pf-warn)' : 'var(--pf-in)'
                return e('div', { key: b.c.id },
                  e('div', { class: 't' }, e('span', null, `${b.c.icon} ${b.c.name}`),
                    e('span', null, `${money(host, b.spent)} ${host.t('of')} ${money(host, b.c.monthly_limit)} · ${over ? host.t('over') + ' ' + money(host, b.spent - b.c.monthly_limit) : host.t('left') + ' ' + money(host, b.c.monthly_limit - b.spent)}`)),
                  e('div', { class: 'pf-track' }, e('div', { class: 'pf-fill', style: `width:${Math.min(100, b.pct * 100)}%;background:${color}` })))
              }))
              : e('p', { class: 'pf-sub' }, host.t('no_budgets') + '. ' + host.t('budgets_hint'))),
          e('div', { class: 'pf-card' }, e('h2', null, host.t('recent')),
            e('div', { class: 'pf-list' }, monthTx.value.slice(0, 7).map(t => txRow(host, ledger, t, null))),
            monthTx.value.length ? null : e('p', { class: 'pf-sub' }, host.t('no_data')),
            e('p', { style: 'margin-top:10px' }, e('a', { href: host.localePath('/admin/x/lumen.personal-finance/transactions'), class: 'pf-sub', style: 'text-decoration:underline' }, host.t('all_ops') + ' →')))),

        modal.value ? e(TxModal, { host, ledger, onClose: () => { modal.value = false } }) : null)
    }
  },
})

// ---------------------------------------------------------------- transactions page
export const TransactionsPage = defineComponent({
  name: 'PfTransactions',
  props: { host: { type: Object, required: true } },
  setup(props) {
    const { host } = props
    const ledger = useLedger(host)
    const ym = ref(curYm())
    const kind = ref('')
    const cat = ref('')
    const q = ref('')
    const modal = ref(false)
    const editing = ref(null)

    const list = computed(() => ledger.txs.value.filter(t => ymOf(t.occurred_on) === ym.value
      && (!kind.value || t.kind === kind.value) && (!cat.value || String(t.category_id || 0) === cat.value)
      && (!q.value || (t.note || '').toLowerCase().includes(q.value.toLowerCase()))))
    const actions = {
      edit: t => { editing.value = t; modal.value = true },
      del: async t => { if (window.confirm(host.t('confirm_delete'))) await ledger.run(Q.delTx, { id: t.id }, 'deleted') },
    }

    return () => {
      if (ledger.loading.value) return e('div', { class: 'pf pf-loading' }, '…')
      if (ledger.denied.value) return e('div', { class: 'pf pf-deny' }, host.t('access_denied'))
      const inc = sum(list.value.filter(t => t.kind === 'income'), t => t.amount)
      const exp = sum(list.value.filter(t => t.kind === 'expense'), t => t.amount)
      return e('div', { class: 'pf' },
        e('div', { class: 'pf-head' },
          e('div', null, e('h1', { class: 'pf-title' }, host.t('nav_transactions')),
            e('p', { class: 'pf-sub' }, `${list.value.length} ${host.t('operations')} · `, e('span', { class: 'pf-in' }, '+' + money(host, inc)), ' · ', e('span', { class: 'pf-out' }, '−' + money(host, exp)))),
          e('button', { class: 'pf-btn primary', onClick: () => { editing.value = null; modal.value = true } }, '＋ ' + host.t('add_transaction'))),
        e('div', { class: 'pf-filters' },
          e('div', { class: 'pf-month' },
            e('button', { onClick: () => { ym.value = shiftYm(ym.value, -1) } }, '‹'), e('span', null, monthName(host, ym.value)), e('button', { onClick: () => { ym.value = shiftYm(ym.value, 1) } }, '›')),
          e('select', { class: 'pf-select', value: kind.value, onChange: ev => { kind.value = ev.target.value } },
            e('option', { value: '' }, '↕'), e('option', { value: 'income', selected: kind.value === 'income' }, host.t('kind_income')), e('option', { value: 'expense', selected: kind.value === 'expense' }, host.t('kind_expense'))),
          e('select', { class: 'pf-select', value: cat.value, onChange: ev => { cat.value = ev.target.value } },
            e('option', { value: '' }, host.t('all_categories')), e('option', { value: '0', selected: cat.value === '0' }, host.t('uncategorized')),
            ledger.categories.value.map(c => e('option', { key: c.id, value: String(c.id), selected: String(c.id) === cat.value }, `${c.icon} ${c.name}`))),
          e('input', { class: 'pf-input', placeholder: '🔎 ' + host.t('note'), value: q.value, onInput: ev => { q.value = ev.target.value } })),
        e('div', { class: 'pf-card' },
          list.value.length ? e('div', { class: 'pf-list' }, list.value.map(t => txRow(host, ledger, t, actions))) : e('div', { class: 'pf-empty' }, host.t('no_data'))),
        modal.value ? e(TxModal, { host, ledger, tx: editing.value, onClose: () => { modal.value = false } }) : null)
    }
  },
})

// ---------------------------------------------------------------- categories & budgets page
export const CategoriesPage = defineComponent({
  name: 'PfCategories',
  props: { host: { type: Object, required: true } },
  setup(props) {
    const { host } = props
    const ledger = useLedger(host)
    const form = ref(null)

    const open = (c, kind) => { form.value = c ? { ...c, monthly_limit: c.monthly_limit ?? '' } : { id: null, name: '', kind, icon: '🏷️', color: COLORS[0], monthly_limit: '' } }
    async function submit(ev) {
      ev.preventDefault()
      const f = form.value
      const ok = await ledger.run(Q.saveCat, { id: f.id, name: f.name, kind: f.kind, icon: f.icon, color: f.color, monthly_limit: f.kind === 'expense' && f.monthly_limit !== '' ? Number(f.monthly_limit) : null })
      if (ok) form.value = null
    }
    const tile = c => e('div', { class: 'pf-card pf-tile', key: c.id },
      e('div', { class: 'top' }, e('div', { class: 'pf-ico', style: `background:${c.color}22` }, c.icon), e('div', null, e('b', null, c.name),
        c.kind === 'expense' ? e('div', { class: 'pf-sub' }, c.monthly_limit ? `${host.t('monthly_limit')}: ${money(host, c.monthly_limit)}` : host.t('limit_none')) : null)),
      e('div', { class: 'act' },
        e('button', { class: 'pf-btn sm', onClick: () => open(c) }, host.t('edit')),
        e('button', { class: 'pf-btn sm danger', onClick: async () => { if (window.confirm(host.t('confirm_delete'))) await ledger.run(Q.delCat, { id: c.id }, 'deleted') } }, host.t('delete'))))
    const section = (title, kind) => e('div', { style: 'margin-bottom:26px' },
      e('div', { class: 'pf-head', style: 'margin-bottom:12px' }, e('h2', { style: 'font-size:17px;font-weight:650' }, title), e('button', { class: 'pf-btn sm', onClick: () => open(null, kind) }, '＋ ' + host.t('add'))),
      e('div', { class: 'pf-tiles' }, ledger.categories.value.filter(c => c.kind === kind).map(tile)))

    return () => {
      if (ledger.loading.value) return e('div', { class: 'pf pf-loading' }, '…')
      if (ledger.denied.value) return e('div', { class: 'pf pf-deny' }, host.t('access_denied'))
      const f = form.value
      return e('div', { class: 'pf' },
        e('div', { class: 'pf-head' }, e('div', null, e('h1', { class: 'pf-title' }, host.t('categories_title')), e('p', { class: 'pf-sub' }, host.t('budgets_hint')))),
        section(host.t('expense_categories'), 'expense'), section(host.t('income_categories'), 'income'),
        f ? e(Modal, { title: host.t(f.id ? 'edit' : 'add'), onClose: () => { form.value = null } }, e('form', { class: 'pf-form', onSubmit: submit },
          e('label', { class: 'pf-label' }, host.t('category_name'), e('input', { class: 'pf-input', required: true, maxlength: 80, value: f.name, onInput: ev => { f.name = ev.target.value } })),
          e('div', { class: 'pf-label' }, host.t('icon'), e('div', { class: 'pf-sw' }, ICONS.map(i => e('span', { key: i, style: `font-size:22px;cursor:pointer;padding:2px 5px;border-radius:9px;${f.icon === i ? 'background:var(--pf-line)' : ''}`, onClick: () => { f.icon = i } }, i)))),
          e('div', { class: 'pf-label' }, '', Swatches(f.color, c => { f.color = c })),
          f.kind === 'expense' ? e('label', { class: 'pf-label' }, host.t('monthly_limit'), e('input', { class: 'pf-input', type: 'number', min: '0', step: '1', value: f.monthly_limit, onInput: ev => { f.monthly_limit = ev.target.value } })) : null,
          e('div', { class: 'pf-row', style: 'justify-content:flex-end' }, e('button', { type: 'button', class: 'pf-btn', onClick: () => { form.value = null } }, host.t('cancel')), e('button', { type: 'submit', class: 'pf-btn primary' }, host.t('save'))))) : null)
    }
  },
})

// ---------------------------------------------------------------- accounts page
export const AccountsPage = defineComponent({
  name: 'PfAccounts',
  props: { host: { type: Object, required: true } },
  setup(props) {
    const { host } = props
    const ledger = useLedger(host)
    const form = ref(null)
    const kinds = [['card', 'kind_card', '💳'], ['cash', 'kind_cash', '💵'], ['savings', 'kind_savings', '🏦']]
    const open = a => { form.value = a ? { ...a } : { id: null, name: '', kind: 'card', opening_balance: 0, color: COLORS[0] } }
    async function submit(ev) {
      ev.preventDefault()
      const f = form.value
      const ok = await ledger.run(Q.saveAcc, { id: f.id, name: f.name, kind: f.kind, opening_balance: Number(f.opening_balance) || 0, color: f.color })
      if (ok) form.value = null
    }

    return () => {
      if (ledger.loading.value) return e('div', { class: 'pf pf-loading' }, '…')
      if (ledger.denied.value) return e('div', { class: 'pf pf-deny' }, host.t('access_denied'))
      const f = form.value
      return e('div', { class: 'pf' },
        e('div', { class: 'pf-head' }, e('div', null, e('h1', { class: 'pf-title' }, host.t('accounts_title')), e('p', { class: 'pf-sub' }, host.t('total_balance') + ': ' + money(host, ledger.total.value))),
          e('button', { class: 'pf-btn primary', onClick: () => open(null) }, '＋ ' + host.t('add'))),
        ledger.accounts.value.length ? e('div', { class: 'pf-tiles' }, ledger.balances.value.map(a => e('div', { class: 'pf-card pf-tile', key: a.id },
          e('div', { class: 'top' }, e('div', { class: 'pf-ico', style: `background:${a.color}22` }, kinds.find(k => k[0] === a.kind)?.[2] || '💳'), e('div', null, e('b', null, a.name), e('div', { class: 'pf-sub' }, host.t(kinds.find(k => k[0] === a.kind)?.[1] || 'kind_card')))),
          e('div', { class: 'bal' }, money(host, a.balance)),
          e('div', { class: 'act' }, e('button', { class: 'pf-btn sm', onClick: () => open(a) }, host.t('edit')),
            e('button', { class: 'pf-btn sm danger', onClick: async () => { if (ledger.txs.value.some(t => t.account_id === Number(a.id))) return host.toast(host.t('account_has_ops'), 'error'); if (window.confirm(host.t('confirm_delete'))) await ledger.run(Q.delAcc, { id: a.id }, 'deleted') } }, host.t('delete')))))) : Empty(host, ledger),
        f ? e(Modal, { title: host.t(f.id ? 'edit' : 'add'), onClose: () => { form.value = null } }, e('form', { class: 'pf-form', onSubmit: submit },
          e('label', { class: 'pf-label' }, host.t('account_name'), e('input', { class: 'pf-input', required: true, maxlength: 80, value: f.name, onInput: ev => { f.name = ev.target.value } })),
          e('div', { class: 'pf-two' },
            e('label', { class: 'pf-label' }, host.t('account_kind'), e('select', { class: 'pf-select', value: f.kind, onChange: ev => { f.kind = ev.target.value } }, kinds.map(k => e('option', { key: k[0], value: k[0], selected: f.kind === k[0] }, host.t(k[1]))))),
            e('label', { class: 'pf-label' }, host.t('opening_balance'), e('input', { class: 'pf-input', type: 'number', step: '0.01', value: f.opening_balance, onInput: ev => { f.opening_balance = ev.target.value } }))),
          Swatches(f.color, c => { f.color = c }),
          e('div', { class: 'pf-row', style: 'justify-content:flex-end' }, e('button', { type: 'button', class: 'pf-btn', onClick: () => { form.value = null } }, host.t('cancel')), e('button', { type: 'submit', class: 'pf-btn primary' }, host.t('save'))))) : null)
    }
  },
})

// ---------------------------------------------------------------- admin dashboard widget
export const MiniDashboard = defineComponent({
  name: 'PfMini',
  props: { host: { type: Object, required: true } },
  setup(props) {
    const { host } = props
    const ledger = useLedger(host)
    const month = computed(() => ledger.txs.value.filter(t => ymOf(t.occurred_on) === curYm()))
    return () => {
      if (ledger.loading.value || ledger.denied.value) return null
      const inc = sum(month.value.filter(t => t.kind === 'income'), t => t.amount)
      const exp = sum(month.value.filter(t => t.kind === 'expense'), t => t.amount)
      return e('div', { class: 'pf', style: 'max-width:none;padding:0' }, e('div', { class: 'pf-card pf-mini' },
        e('div', { class: 'pf-sub' }, '💰 ' + host.t('app_name') + ' · ' + host.t('this_month')),
        e('div', { class: 'big' }, money(host, ledger.total.value)),
        e('div', { class: 'pf-row', style: 'gap:18px' }, e('span', { class: 'pf-in' }, '↓ ' + money(host, inc)), e('span', { class: 'pf-out' }, '↑ ' + money(host, exp))),
        e('a', { class: 'pf-sub', style: 'text-decoration:underline', href: host.localePath('/admin/x/lumen.personal-finance') }, host.t('nav_overview') + ' →')))
    }
  },
})

// ---------------------------------------------------------------- public home page
export const Home = defineComponent({
  name: 'PfHome',
  props: { host: { type: Object, required: true } },
  setup(props) {
    const { host } = props
    injectCss()
    return () => {
      if (host.user) return e(Overview, { host })
      return e('div', { class: 'pf pf-landing' },
        e('div', { class: 'pf-lhero' },
          e('div', null, e('h1', null, host.t('landing_title')), e('p', null, host.t('landing_sub')),
            e('a', { class: 'pf-cta', href: host.localePath('/auth/login') }, host.t('landing_cta') + ' →')),
          e('div', { class: 'pf-mock' },
            e('div', null, e('div', { style: 'opacity:.75;font-size:13px' }, host.t('total_balance')), e('div', { class: 'big' }, money(host, 446500))),
            e('div', { class: 'row' }, e('span', null, '💼 ' + host.t('income')), e('b', null, '+' + money(host, 156000))),
            e('div', { class: 'row' }, e('span', null, '🛒 ' + host.t('expense')), e('b', null, '−' + money(host, 68400))),
            e('div', { class: 'row' }, e('span', null, '🎯 ' + host.t('savings_rate')), e('b', null, '56%')))),
        e('div', { class: 'pf-feat' },
          [['🧾', 'landing_f1_t', 'landing_f1_d'], ['🎯', 'landing_f2_t', 'landing_f2_d'], ['📊', 'landing_f3_t', 'landing_f3_d']].map(([ic, t, d]) =>
            e('div', { class: 'pf-card', key: t }, e('div', { class: 'ic' }, ic), e('h3', null, host.t(t)), e('p', null, host.t(d))))))
    }
  },
})
