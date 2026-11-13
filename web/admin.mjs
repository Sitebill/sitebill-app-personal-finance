// Admin pages of Personal Finance. Key = page path relative to /admin/x/rumantic.personal-finance/
import { Overview, TransactionsPage, CategoriesPage, AccountsPage, MiniDashboard } from './shared.mjs'

export const pages = { '': Overview, transactions: TransactionsPage, categories: CategoriesPage, accounts: AccountsPage }

// Component names from manifest.json: admin.widgets and shell.adminDashboard.
export const widgets = { FinanceDashboard: MiniDashboard }
