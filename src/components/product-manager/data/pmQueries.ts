import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Generic loader hook for Product Manager tables. */
export function usePMData<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      setData(await loader());
    } catch (err) {
      console.error('Product Manager data load failed', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, refetch, setData };
}

const rows = <T,>(res: { data: unknown; error: unknown }): T[] => {
  if (res.error) throw res.error;
  return (res.data as T[]) || [];
};

// ---------- Inventory ----------
export async function fetchInventory() {
  const res = await supabase
    .from('product_inventory')
    .select('id, product_id, stock_type, total_stock, available_stock, reserved, low_threshold, auto_restock, forecast_note, products(product_name)')
    .order('created_at');
  return rows<any>(res).map((r) => {
    const status =
      r.stock_type === 'unlimited' || r.available_stock > r.low_threshold * 2
        ? 'healthy'
        : r.available_stock > r.low_threshold
          ? 'low'
          : 'critical';
    return {
      id: r.id,
      product_name: r.products?.product_name ?? 'Unknown product',
      stock_type: r.stock_type,
      total_stock: r.total_stock,
      available_stock: r.available_stock,
      reserved: r.reserved,
      low_threshold: r.low_threshold,
      auto_restock: r.auto_restock,
      status,
      ai_forecast: r.forecast_note ?? undefined,
    };
  });
}

export async function restockInventory(id: string, total: number) {
  const { error } = await supabase
    .from('product_inventory')
    .update({ available_stock: total })
    .eq('id', id);
  if (error) throw error;
}

export async function setAutoRestock(id: string, value: boolean) {
  const { error } = await supabase.from('product_inventory').update({ auto_restock: value }).eq('id', id);
  if (error) throw error;
}

// ---------- Orders ----------
export async function fetchOrders() {
  const res = await supabase
    .from('product_orders')
    .select('id, order_number, product_name, customer_name, customer_email, quantity, total, currency, status, payment_status, license_key, created_at')
    .order('created_at', { ascending: false });
  return rows<any>(res).map((o) => ({ ...o, total: Number(o.total) }));
}

export async function updateOrderStatus(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('product_orders').update(patch as never).eq('id', id);
  if (error) throw error;
}

// ---------- Pricing plans ----------
export async function fetchPricingPlans() {
  const res = await supabase
    .from('product_pricing_plans')
    .select('id, name, model, price, currency, billing_cycle, tier_level, country, features, is_active, products(product_name)')
    .order('created_at');
  return rows<any>(res).map((p) => ({
    id: p.id,
    name: p.name,
    product_name: p.products?.product_name ?? 'All products',
    model: p.model,
    price: Number(p.price),
    currency: p.currency,
    billing_cycle: p.billing_cycle ?? undefined,
    tier_level: p.tier_level ?? undefined,
    country: p.country ?? undefined,
    is_active: p.is_active,
    features: p.features ?? [],
  }));
}

export async function createPricingPlan(plan: Record<string, unknown>) {
  const { error } = await supabase.from('product_pricing_plans').insert(plan as never);
  if (error) throw error;
}

export async function updatePricingPlan(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('product_pricing_plans').update(patch as never).eq('id', id);
  if (error) throw error;
}

// ---------- Licenses ----------
export async function fetchLicenses() {
  const res = await supabase
    .from('product_licenses')
    .select('id, license_key, product_id, product_name, domain_bound, user_email, status, locked, expires_at, created_at')
    .order('created_at', { ascending: false });
  return rows<any>(res);
}

export async function insertLicenses(records: Record<string, unknown>[]) {
  const { error } = await supabase.from('product_licenses').insert(records as never);
  if (error) throw error;
}

export async function updateLicense(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('product_licenses').update(patch as never).eq('id', id);
  if (error) throw error;
}

// ---------- Roles & country access ----------
export async function fetchRoles() {
  const res = await supabase.from('pm_roles').select('id, code, name, level, permissions').order('level');
  return rows<any>(res);
}

export async function updateRolePermissions(id: string, permissions: Record<string, boolean>) {
  const { error } = await supabase.from('pm_roles').update({ permissions } as never).eq('id', id);
  if (error) throw error;
}

export async function fetchCountryAccess() {
  const res = await supabase.from('pm_country_access').select('id, country_code, name, enabled, franchises').order('name');
  return rows<any>(res);
}

export async function updateCountryAccess(id: string, enabled: boolean) {
  const { error } = await supabase.from('pm_country_access').update({ enabled } as never).eq('id', id);
  if (error) throw error;
}

// ---------- Approvals ----------
export async function fetchApprovals() {
  const res = await supabase
    .from('pm_approvals')
    .select('id, reference, type, title, requested_by, requested_at, status, priority, details')
    .order('requested_at', { ascending: false });
  return rows<any>(res);
}

export async function decideApproval(id: string, status: string, note?: string) {
  const { error } = await supabase
    .from('pm_approvals')
    .update({ status, decided_at: new Date().toISOString(), decision_note: note ?? null } as never)
    .eq('id', id);
  if (error) throw error;
}

// ---------- Deployments ----------
export async function fetchServers() {
  const res = await supabase.from('pm_servers').select('id, code, name, region, status, load').order('name');
  return rows<any>(res);
}

export async function fetchDeployments() {
  const res = await supabase
    .from('pm_deployments')
    .select('id, reference, product_name, version, environment, status, server_code, deployed_at')
    .order('deployed_at', { ascending: false });
  return rows<any>(res);
}

export async function fetchDeploymentLogs() {
  const res = await supabase
    .from('pm_deployment_logs')
    .select('id, deployment_reference, level, message, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  return rows<any>(res);
}

export async function insertDeployment(record: Record<string, unknown>) {
  const { error } = await supabase.from('pm_deployments').insert(record as never);
  if (error) throw error;
}

export async function insertDeploymentLog(record: Record<string, unknown>) {
  const { error } = await supabase.from('pm_deployment_logs').insert(record as never);
  if (error) throw error;
}

export async function updateDeployment(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('pm_deployments').update(patch as never).eq('id', id);
  if (error) throw error;
}

// ---------- Builds ----------
export async function fetchBuilds() {
  const res = await supabase
    .from('pm_builds')
    .select('id, reference, name, type, size, status, locked, version, file_url, uploaded_at')
    .order('uploaded_at', { ascending: false });
  return rows<any>(res);
}

export async function updateBuild(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('pm_builds').update(patch as never).eq('id', id);
  if (error) throw error;
}

export async function insertBuild(record: Record<string, unknown>) {
  const { error } = await supabase.from('pm_builds').insert(record as never);
  if (error) throw error;
}

export async function deleteBuild(id: string) {
  const { error } = await supabase.from('pm_builds').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchBuildVersions() {
  const res = await supabase
    .from('pm_build_versions')
    .select('id, reference, version, released_on, changes, author')
    .order('released_on', { ascending: false });
  return rows<any>(res);
}

// ---------- Modules ----------
export async function fetchModules() {
  const res = await supabase
    .from('pm_modules')
    .select('id, reference, name, type, status, locked, role_restricted')
    .order('reference');
  return rows<any>(res);
}

export async function updateModule(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('pm_modules').update(patch as never).eq('id', id);
  if (error) throw error;
}

// ---------- Security ----------
export async function fetchApiKeys() {
  const res = await supabase
    .from('pm_api_keys')
    .select('id, reference, name, key_preview, status, last_used_at, created_at')
    .order('created_at', { ascending: false });
  return rows<any>(res);
}

export async function updateApiKey(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('pm_api_keys').update(patch as never).eq('id', id);
  if (error) throw error;
}

export async function fetchAbuseAlerts() {
  const res = await supabase
    .from('pm_abuse_alerts')
    .select('id, reference, type, product_name, ip_address, severity, detected_at, resolved')
    .order('detected_at', { ascending: false });
  return rows<any>(res);
}

export async function resolveAbuseAlert(id: string, resolved: boolean) {
  const { error } = await supabase.from('pm_abuse_alerts').update({ resolved } as never).eq('id', id);
  if (error) throw error;
}

// ---------- Analytics ----------
const PALETTE = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500'];

export async function fetchAnalytics() {
  const [perf, funnel, countries] = await Promise.all([
    supabase.from('pm_product_performance').select('product_name, sales, change_percent, period_month').order('sales', { ascending: false }),
    supabase.from('pm_demo_funnel').select('stage, count, display_order').order('display_order'),
    supabase.from('pm_country_sales').select('country, sales').order('sales', { ascending: false }),
  ]);

  const performance = rows<any>(perf).map((p, i) => ({
    label: p.product_name,
    value: p.sales,
    change: Number(p.change_percent),
    color: PALETTE[i % PALETTE.length],
  }));

  const funnelRows = rows<any>(funnel);
  const funnelTop = funnelRows[0]?.count || 1;
  const demoFunnel = funnelRows.map((f) => ({
    stage: f.stage,
    count: f.count,
    percentage: Math.round((f.count / funnelTop) * 100),
  }));

  const countryRows = rows<any>(countries);
  const countryTotal = countryRows.reduce((sum, c) => sum + c.sales, 0) || 1;
  const countryData = countryRows.map((c) => ({
    country: c.country,
    sales: c.sales,
    percentage: Math.round((c.sales / countryTotal) * 100),
  }));

  return { performance, demoFunnel, countryData };
}

// ---------- Software profile ----------
export async function fetchSoftwareProfile() {
  const res = await supabase
    .from('pm_software_profiles')
    .select('id, reference, name, version, status, description, modules, ownership, deployed_to, active_users, created_at, updated_at')
    .order('created_at')
    .limit(1);
  return rows<any>(res)[0] ?? null;
}

export async function updateSoftwareProfile(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from('pm_software_profiles').update(patch as never).eq('id', id);
  if (error) throw error;
}

// ---------- Reports ----------
export async function fetchUsageReport() {
  const [perf, orders] = await Promise.all([
    supabase.from('pm_product_performance').select('product_name, sales, change_percent').order('sales', { ascending: false }),
    supabase.from('product_orders').select('product_name, quantity'),
  ]);
  const orderRows = rows<any>(orders);
  return rows<any>(perf).map((p) => {
    const productOrders = orderRows.filter((o) => o.product_name === p.product_name);
    const units = productOrders.reduce((sum, o) => sum + o.quantity, 0);
    return {
      product: p.product_name,
      users: p.sales,
      sessions: p.sales * 40 + units,
      orders: productOrders.length,
      units,
      trend: Number(p.change_percent),
    };
  });
}

export async function fetchDeploymentSuccessReport() {
  const deployments = await fetchDeployments();
  const byMonth = new Map<string, { month: string; total: number; success: number; failed: number }>();
  for (const d of deployments) {
    const date = new Date(d.deployed_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    const entry = byMonth.get(key) ?? { month: label, total: 0, success: 0, failed: 0 };
    entry.total += 1;
    if (d.status === 'failed') entry.failed += 1;
    else if (d.status === 'deployed' || d.status === 'rolled_back') entry.success += 1;
    byMonth.set(key, entry);
  }
  return Array.from(byMonth.values()).map((m) => ({
    ...m,
    rate: m.total ? Math.round((m.success / m.total) * 1000) / 10 : 0,
  }));
}

export async function fetchFailureReport() {
  const deployments = await fetchDeployments();
  const logs = await fetchDeploymentLogs();
  return deployments
    .filter((d) => d.status === 'failed')
    .map((d) => ({
      id: d.reference,
      product: d.product_name,
      version: d.version,
      date: new Date(d.deployed_at).toLocaleDateString(),
      reason:
        logs.find((l) => l.deployment_reference === d.reference && l.level === 'error')?.message ??
        'Deployment failed — see deployment logs',
      resolved: false,
    }));
}

export async function fetchExportRows(kind: string): Promise<Record<string, unknown>[]> {
  switch (kind) {
    case 'Product Catalog': {
      const res = await supabase.from('products').select('product_code, product_name, product_type, status, version, lifetime_price, monthly_price, currency');
      return rows<any>(res);
    }
    case 'Deployment History':
      return (await fetchDeployments()) as Record<string, unknown>[];
    case 'Usage Analytics':
      return (await fetchUsageReport()) as unknown as Record<string, unknown>[];
    case 'License Summary':
      return (await fetchLicenses()) as Record<string, unknown>[];
    case 'Audit Logs': {
      const res = await supabase
        .from('product_action_logs')
        .select('product_name, action, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      return rows<any>(res);
    }
    default: {
      const [products, deployments, licenses] = await Promise.all([
        fetchExportRows('Product Catalog'),
        fetchExportRows('Deployment History'),
        fetchExportRows('License Summary'),
      ]);
      return [
        ...products.map((r) => ({ section: 'product', ...r })),
        ...deployments.map((r) => ({ section: 'deployment', ...r })),
        ...licenses.map((r) => ({ section: 'license', ...r })),
      ];
    }
  }
}

export function downloadCsv(filename: string, records: Record<string, unknown>[]) {
  if (!records.length) return false;
  const headers = Array.from(new Set(records.flatMap((r) => Object.keys(r))));
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...records.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
