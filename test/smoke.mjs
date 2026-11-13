// Browser-free smoke test: mounts every page with a fake host (jsdom + the same Vue the platform uses).
// Usage: node test/smoke.mjs <path-to-a-folder-with-node_modules-containing-vue-and-jsdom>
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.argv[2]
if (!root) throw new Error('pass a directory that has vue and jsdom in node_modules')
const req = createRequire(path.join(path.resolve(root), 'x.js'))
const { JSDOM } = req('jsdom')
const dom = new JSDOM('<!doctype html><body><div id="app"></div></body>', { pretendToBeVisual: true })
for (const k of ['window', 'document', 'navigator', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'Event']) {
  Object.defineProperty(globalThis, k, { value: k === 'window' ? dom.window : dom.window[k], configurable: true, writable: true })
}
const Vue = req('vue')
globalThis.__SB_HOST__ = { vue: Vue }

const today = new Date()
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const accounts = [{ id: '1', name: 'Card', kind: 'card', opening_balance: 1000, color: '#6366f1' }]
const categories = [
  { id: '1', name: 'Food', kind: 'expense', icon: '🛒', color: '#f97316', monthly_limit: 500 },
  { id: '2', name: 'Salary', kind: 'income', icon: '💼', color: '#10b981', monthly_limit: null },
]
const txs = [
  { id: '1', account_id: 1, category_id: 1, kind: 'expense', amount: 420, occurred_on: iso(today), note: 'Market' },
  { id: '2', account_id: 1, category_id: 2, kind: 'income', amount: 3000, occurred_on: iso(today), note: null },
]
const makeHost = (user, deny = false) => ({
  locale: 'en', user,
  t: (k) => k,
  localePath: (p) => p,
  toast: () => {},
  gql: async (q) => {
    if (deny) throw new Error('Unauthorized')
    if (q.includes('financeAccounts')) return { financeAccounts: accounts }
    if (q.includes('financeCategories')) return { financeCategories: categories }
    if (q.includes('financeTransactions')) return { financeTransactions: txs }
    return {}
  },
})

const tick = () => new Promise(r => setTimeout(r, 30))
const base = pathToFileURL(path.resolve('web')).href
const { pages, widgets } = await import(`${base}/admin.mjs`)
const site = await import(`${base}/site.mjs`)

let failed = 0
async function render(name, comp, host, expect) {
  const warns = []
  const el = document.createElement('div')
  document.body.appendChild(el)
  const app = Vue.createApp(comp, { host })
  app.config.warnHandler = (m) => warns.push(m)
  app.config.errorHandler = (err) => { warns.push(String(err)) }
  app.mount(el)
  await tick(); await tick()
  const text = el.textContent
  const ok = expect.every(s => text.includes(s)) && !warns.length
  if (!ok) { failed++; console.log('FAIL', name, warns.slice(0, 3), text.slice(0, 160)) } else console.log('ok  ', name)
  app.unmount()
}

await render('home as guest', site.widgets.FinanceHome, makeHost(null), ['landing_title', 'landing_cta'])
await render('home as owner', site.widgets.FinanceHome, makeHost({ id: 1 }), ['total_balance', 'chart_by_category', 'budgets_title'])
await render('overview', pages[''], makeHost({ id: 1 }), ['total_balance', 'Food', 'income'])
await render('transactions', pages.transactions, makeHost({ id: 1 }), ['nav_transactions', 'Market'])
await render('categories', pages.categories, makeHost({ id: 1 }), ['expense_categories', 'Food'])
await render('accounts', pages.accounts, makeHost({ id: 1 }), ['accounts_title', 'Card'])
await render('dashboard widget', widgets.FinanceDashboard, makeHost({ id: 1 }), ['app_name'])
await render('denied', pages[''], makeHost({ id: 1 }, true), ['access_denied'])
process.exit(failed ? 1 : 0)
