-- ============ helpers ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- ============ categories ============
CREATE TABLE public.business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_categories TO authenticated;
GRANT ALL ON public.business_categories TO service_role;
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage business_categories" ON public.business_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_business_categories_updated BEFORE UPDATE ON public.business_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.business_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.business_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_subcategories TO authenticated;
GRANT ALL ON public.business_subcategories TO service_role;
ALTER TABLE public.business_subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage business_subcategories" ON public.business_subcategories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_business_subcategories_updated BEFORE UPDATE ON public.business_subcategories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ products ============
CREATE TABLE public.products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT NOT NULL UNIQUE DEFAULT ('PRD-' || upper(substr(md5(random()::text), 1, 8))),
  product_name TEXT NOT NULL,
  slug TEXT UNIQUE,
  product_type TEXT NOT NULL DEFAULT 'software',
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT,
  business_category_id UUID REFERENCES public.business_categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.business_subcategories(id) ON DELETE SET NULL,
  pricing_model TEXT NOT NULL DEFAULT 'one_time',
  lifetime_price NUMERIC NOT NULL DEFAULT 0,
  monthly_price NUMERIC NOT NULL DEFAULT 0,
  discount_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft',
  features_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  gallery_urls TEXT[] NOT NULL DEFAULT '{}',
  preview_urls TEXT[] NOT NULL DEFAULT '{}',
  video_thumbnail_url TEXT,
  main_file_url TEXT,
  version TEXT NOT NULL DEFAULT 'v1.0',
  changelog TEXT,
  demo_type TEXT DEFAULT 'live',
  demo_url TEXT,
  demo_embed TEXT,
  demo_video_url TEXT,
  demo_credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  documentation_url TEXT,
  support_url TEXT,
  blog_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_subscription BOOLEAN NOT NULL DEFAULT false,
  trending BOOLEAN NOT NULL DEFAULT false,
  verified_author BOOLEAN NOT NULL DEFAULT false,
  license_type TEXT NOT NULL DEFAULT 'standard',
  license_tier TEXT NOT NULL DEFAULT 'basic',
  compatibility TEXT[] NOT NULL DEFAULT '{}',
  difficulty_level TEXT NOT NULL DEFAULT 'basic',
  industry_tags TEXT[] NOT NULL DEFAULT '{}',
  tech_stack_tags TEXT[] NOT NULL DEFAULT '{}',
  use_case_tags TEXT[] NOT NULL DEFAULT '{}',
  feature_list TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT,
  installation_guide TEXT,
  release_notes TEXT,
  search_keywords TEXT[] NOT NULL DEFAULT '{}',
  synonyms TEXT[] NOT NULL DEFAULT '{}',
  coupon_code TEXT,
  support_response_time TEXT,
  manual_rank INTEGER NOT NULL DEFAULT 0,
  featured_rank INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_category ON public.products(business_category_id);

-- ============ demos ============
CREATE TABLE public.demos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  category TEXT NOT NULL DEFAULT 'product_demo',
  access_type TEXT NOT NULL DEFAULT 'public',
  description TEXT,
  total_views INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demos TO authenticated;
GRANT ALL ON public.demos TO service_role;
ALTER TABLE public.demos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage demos" ON public.demos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_demos_updated BEFORE UPDATE ON public.demos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.product_demo_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  demo_id UUID NOT NULL REFERENCES public.demos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, demo_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_demo_mappings TO authenticated;
GRANT ALL ON public.product_demo_mappings TO service_role;
ALTER TABLE public.product_demo_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage product_demo_mappings" ON public.product_demo_mappings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ audit log ============
CREATE TABLE public.product_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID,
  product_name TEXT NOT NULL DEFAULT 'Unknown',
  action TEXT NOT NULL,
  action_details JSONB,
  performed_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_action_logs TO authenticated;
GRANT ALL ON public.product_action_logs TO service_role;
ALTER TABLE public.product_action_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage product_action_logs" ON public.product_action_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_pal_product ON public.product_action_logs(product_id);
CREATE INDEX idx_pal_created ON public.product_action_logs(created_at DESC);

-- ============ pricing plans ============
CREATE TABLE public.product_pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(product_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'one_time',
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_cycle TEXT,
  tier_level INTEGER,
  country TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_pricing_plans TO authenticated;
GRANT ALL ON public.product_pricing_plans TO service_role;
ALTER TABLE public.product_pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage product_pricing_plans" ON public.product_pricing_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.product_pricing_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ inventory ============
CREATE TABLE public.product_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(product_id) ON DELETE CASCADE,
  stock_type TEXT NOT NULL DEFAULT 'license',
  total_stock INTEGER NOT NULL DEFAULT 0,
  available_stock INTEGER NOT NULL DEFAULT 0,
  reserved INTEGER NOT NULL DEFAULT 0,
  low_threshold INTEGER NOT NULL DEFAULT 0,
  auto_restock BOOLEAN NOT NULL DEFAULT false,
  forecast_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_inventory TO authenticated;
GRANT ALL ON public.product_inventory TO service_role;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage product_inventory" ON public.product_inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_inventory_updated BEFORE UPDATE ON public.product_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ orders ============
CREATE TABLE public.product_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  product_id UUID REFERENCES public.products(product_id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  license_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_orders TO authenticated;
GRANT ALL ON public.product_orders TO service_role;
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage product_orders" ON public.product_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.product_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ licenses ============
CREATE TABLE public.product_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT NOT NULL UNIQUE,
  product_id UUID REFERENCES public.products(product_id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  domain_bound TEXT,
  user_email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  locked BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_licenses TO authenticated;
GRANT ALL ON public.product_licenses TO service_role;
ALTER TABLE public.product_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage product_licenses" ON public.product_licenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_licenses_updated BEFORE UPDATE ON public.product_licenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ access control ============
CREATE TABLE public.pm_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  permissions JSONB NOT NULL DEFAULT '{"view":true,"copy":false,"download":false,"edit":false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_roles TO authenticated;
GRANT ALL ON public.pm_roles TO service_role;
ALTER TABLE public.pm_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_roles" ON public.pm_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pm_roles_updated BEFORE UPDATE ON public.pm_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pm_country_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  franchises INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_country_access TO authenticated;
GRANT ALL ON public.pm_country_access TO service_role;
ALTER TABLE public.pm_country_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_country_access" ON public.pm_country_access FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pm_country_updated BEFORE UPDATE ON public.pm_country_access FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ approvals ============
CREATE TABLE public.pm_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  details TEXT,
  decided_at TIMESTAMPTZ,
  decision_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_approvals TO authenticated;
GRANT ALL ON public.pm_approvals TO service_role;
ALTER TABLE public.pm_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_approvals" ON public.pm_approvals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pm_approvals_updated BEFORE UPDATE ON public.pm_approvals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ deployment ============
CREATE TABLE public.pm_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'online',
  load INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_servers TO authenticated;
GRANT ALL ON public.pm_servers TO service_role;
ALTER TABLE public.pm_servers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_servers" ON public.pm_servers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pm_servers_updated BEFORE UPDATE ON public.pm_servers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pm_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  version TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'staging',
  status TEXT NOT NULL DEFAULT 'deploying',
  server_code TEXT,
  deployed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_deployments TO authenticated;
GRANT ALL ON public.pm_deployments TO service_role;
ALTER TABLE public.pm_deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_deployments" ON public.pm_deployments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pm_deployments_updated BEFORE UPDATE ON public.pm_deployments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pm_deployment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_reference TEXT,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_deployment_logs TO authenticated;
GRANT ALL ON public.pm_deployment_logs TO service_role;
ALTER TABLE public.pm_deployment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_deployment_logs" ON public.pm_deployment_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ builds / modules ============
CREATE TABLE public.pm_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'web',
  size TEXT,
  status TEXT NOT NULL DEFAULT 'ready',
  locked BOOLEAN NOT NULL DEFAULT false,
  version TEXT NOT NULL DEFAULT 'v1.0',
  file_url TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_builds TO authenticated;
GRANT ALL ON public.pm_builds TO service_role;
ALTER TABLE public.pm_builds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_builds" ON public.pm_builds FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pm_builds_updated BEFORE UPDATE ON public.pm_builds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pm_build_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  version TEXT NOT NULL,
  released_on DATE NOT NULL DEFAULT CURRENT_DATE,
  changes TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Dev Team',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_build_versions TO authenticated;
GRANT ALL ON public.pm_build_versions TO service_role;
ALTER TABLE public.pm_build_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_build_versions" ON public.pm_build_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.pm_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'optional',
  status TEXT NOT NULL DEFAULT 'active',
  locked BOOLEAN NOT NULL DEFAULT false,
  role_restricted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_modules TO authenticated;
GRANT ALL ON public.pm_modules TO service_role;
ALTER TABLE public.pm_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_modules" ON public.pm_modules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pm_modules_updated BEFORE UPDATE ON public.pm_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ security ============
CREATE TABLE public.pm_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  key_preview TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_api_keys TO authenticated;
GRANT ALL ON public.pm_api_keys TO service_role;
ALTER TABLE public.pm_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_api_keys" ON public.pm_api_keys FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pm_api_keys_updated BEFORE UPDATE ON public.pm_api_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pm_abuse_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  product_name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_abuse_alerts TO authenticated;
GRANT ALL ON public.pm_abuse_alerts TO service_role;
ALTER TABLE public.pm_abuse_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_abuse_alerts" ON public.pm_abuse_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pm_abuse_updated BEFORE UPDATE ON public.pm_abuse_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ analytics ============
CREATE TABLE public.pm_product_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  sales INTEGER NOT NULL DEFAULT 0,
  change_percent NUMERIC NOT NULL DEFAULT 0,
  period_month DATE NOT NULL DEFAULT date_trunc('month', now())::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_product_performance TO authenticated;
GRANT ALL ON public.pm_product_performance TO service_role;
ALTER TABLE public.pm_product_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_product_performance" ON public.pm_product_performance FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.pm_demo_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  period_month DATE NOT NULL DEFAULT date_trunc('month', now())::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_demo_funnel TO authenticated;
GRANT ALL ON public.pm_demo_funnel TO service_role;
ALTER TABLE public.pm_demo_funnel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_demo_funnel" ON public.pm_demo_funnel FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.pm_country_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  sales INTEGER NOT NULL DEFAULT 0,
  period_month DATE NOT NULL DEFAULT date_trunc('month', now())::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_country_sales TO authenticated;
GRANT ALL ON public.pm_country_sales TO service_role;
ALTER TABLE public.pm_country_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_country_sales" ON public.pm_country_sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ software profile + settings ============
CREATE TABLE public.pm_software_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT 'v1.0',
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  modules TEXT[] NOT NULL DEFAULT '{}',
  ownership TEXT NOT NULL DEFAULT 'Software Vala',
  deployed_to INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_software_profiles TO authenticated;
GRANT ALL ON public.pm_software_profiles TO service_role;
ALTER TABLE public.pm_software_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_software_profiles" ON public.pm_software_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pm_software_updated BEFORE UPDATE ON public.pm_software_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pm_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_settings TO authenticated;
GRANT ALL ON public.pm_settings TO service_role;
ALTER TABLE public.pm_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pm_settings" ON public.pm_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pm_settings_updated BEFORE UPDATE ON public.pm_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================= SEED =================
INSERT INTO public.business_categories (name, description, icon, display_order) VALUES
  ('Business Software', 'ERP, CRM and back-office platforms', 'Building2', 1),
  ('Retail & POS', 'Point of sale and retail management', 'ShoppingCart', 2),
  ('Human Resources', 'HR, payroll and workforce tools', 'Users', 3),
  ('Finance & Accounting', 'Accounting, billing and compliance', 'Calculator', 4),
  ('Healthcare', 'Clinic, pharmacy and hospital systems', 'HeartPulse', 5),
  ('Education', 'School and institute management', 'GraduationCap', 6);

INSERT INTO public.business_subcategories (category_id, name, display_order)
SELECT c.id, s.name, s.ord FROM public.business_categories c
JOIN (VALUES
  ('Business Software','ERP Suites',1),
  ('Business Software','CRM Platforms',2),
  ('Business Software','Project Management',3),
  ('Retail & POS','Restaurant POS',1),
  ('Retail & POS','Retail POS',2),
  ('Retail & POS','Inventory Management',3),
  ('Human Resources','Payroll',1),
  ('Human Resources','Attendance & Leave',2),
  ('Finance & Accounting','Bookkeeping',1),
  ('Finance & Accounting','GST & Billing',2),
  ('Healthcare','Clinic Management',1),
  ('Healthcare','Pharmacy Management',2),
  ('Education','School ERP',1),
  ('Education','Learning Management',2)
) AS s(cat, name, ord) ON s.cat = c.name;

INSERT INTO public.demos (title, url, status, category, access_type, description, total_views, conversions) VALUES
  ('Vala ERP Suite — Live Demo', 'https://demo.softwarevala.com/erp', 'active', 'product_demo', 'public', 'Full ERP walkthrough with sample company data', 1840, 96),
  ('Vala CRM Pro — Live Demo', 'https://demo.softwarevala.com/crm', 'active', 'product_demo', 'public', 'Sales pipeline, leads and automation demo', 1420, 74),
  ('Vala Restaurant POS — Live Demo', 'https://demo.softwarevala.com/pos', 'active', 'product_demo', 'public', 'Billing, KOT and table management demo', 980, 51),
  ('Vala HR Manager — Live Demo', 'https://demo.softwarevala.com/hr', 'active', 'product_demo', 'private', 'Payroll and attendance demo environment', 610, 28),
  ('Vala Clinic Suite — Live Demo', 'https://demo.softwarevala.com/clinic', 'inactive', 'product_demo', 'public', 'Appointments and prescriptions demo', 340, 12);

INSERT INTO public.products (
  product_name, slug, product_type, short_description, description, business_category_id, subcategory_id,
  pricing_model, lifetime_price, monthly_price, status, features_json, tags, version,
  demo_type, demo_url, documentation_url, support_url, meta_title, meta_description, keywords,
  is_featured, is_subscription, trending, verified_author, license_type, license_tier,
  difficulty_level, industry_tags, tech_stack_tags, use_case_tags, feature_list,
  requirements, installation_guide, release_notes, search_keywords, support_response_time, featured_rank
)
SELECT * FROM (
  SELECT
    'Vala ERP Suite'::text, 'vala-erp-suite'::text, 'software'::text,
    'End-to-end ERP for growing enterprises'::text,
    'Vala ERP Suite unifies finance, inventory, purchase, sales and manufacturing into one platform with role-based dashboards, approval workflows and multi-branch support.'::text,
    (SELECT id FROM public.business_categories WHERE name='Business Software'),
    (SELECT id FROM public.business_subcategories WHERE name='ERP Suites'),
    'subscription'::text, 1499::numeric, 149::numeric, 'active'::text,
    '["Multi-branch accounting","Inventory & warehouse","Purchase & sales workflows","Approval chains","Role based dashboards"]'::jsonb,
    ARRAY['erp','finance','inventory'], 'v3.2.1'::text,
    'live'::text, 'https://demo.softwarevala.com/erp'::text, 'https://docs.softwarevala.com/erp'::text, 'https://support.softwarevala.com'::text,
    'Vala ERP Suite — Enterprise Resource Planning'::text, 'Unified ERP with finance, inventory and manufacturing modules for multi-branch businesses.'::text,
    ARRAY['erp software','inventory','accounting'],
    true, true, true, true, 'commercial'::text, 'enterprise'::text,
    'advanced'::text, ARRAY['Manufacturing','Distribution'], ARRAY['React','Node.js','PostgreSQL'], ARRAY['Finance','Operations'],
    ARRAY['GST ready','Audit trail','Multi-currency'],
    '4 vCPU, 8GB RAM, PostgreSQL 14+'::text, 'Deploy via Docker compose, run migrations, configure company profile.'::text,
    'Performance improvements to the ledger engine and new manufacturing dashboards.'::text,
    ARRAY['erp','resource planning'], 'Under 4 hours'::text, 1
  UNION ALL SELECT
    'Vala CRM Pro', 'vala-crm-pro', 'software',
    'Sales pipeline and customer lifecycle CRM',
    'Vala CRM Pro handles leads, deals, quotations and post-sale support with automation rules, email sync and territory management.',
    (SELECT id FROM public.business_categories WHERE name='Business Software'),
    (SELECT id FROM public.business_subcategories WHERE name='CRM Platforms'),
    'subscription', 899, 79, 'active',
    '["Lead capture","Deal pipeline","Quotation builder","Email & WhatsApp sync","Territory management"]'::jsonb,
    ARRAY['crm','sales'], 'v2.9.0',
    'live', 'https://demo.softwarevala.com/crm', 'https://docs.softwarevala.com/crm', 'https://support.softwarevala.com',
    'Vala CRM Pro — Sales CRM', 'Manage leads, deals and customer relationships with automation and analytics.',
    ARRAY['crm','sales software'],
    true, true, true, true, 'commercial', 'professional',
    'intermediate', ARRAY['Services','Retail'], ARRAY['React','Supabase'], ARRAY['Sales','Support'],
    ARRAY['Pipeline analytics','Automation rules'],
    '2 vCPU, 4GB RAM', 'One-click cloud provisioning or self-host with Docker.',
    'Added dashboard analytics and bulk lead import.',
    ARRAY['crm','pipeline'], 'Under 8 hours', 2
  UNION ALL SELECT
    'Vala Restaurant POS', 'vala-restaurant-pos', 'software',
    'Billing, KOT and table management for restaurants',
    'Vala Restaurant POS runs offline-first billing, kitchen order tickets, table plans, delivery aggregator sync and daily settlement reports.',
    (SELECT id FROM public.business_categories WHERE name='Retail & POS'),
    (SELECT id FROM public.business_subcategories WHERE name='Restaurant POS'),
    'one_time', 599, 0, 'active',
    '["Offline billing","KOT printing","Table plan","Aggregator sync","Daily settlement"]'::jsonb,
    ARRAY['pos','restaurant'], 'v4.1.2',
    'live', 'https://demo.softwarevala.com/pos', 'https://docs.softwarevala.com/pos', 'https://support.softwarevala.com',
    'Vala Restaurant POS — Billing & KOT', 'Offline-first restaurant billing with KOT, table management and settlement reports.',
    ARRAY['restaurant pos','billing software'],
    true, false, false, true, 'commercial', 'standard',
    'basic', ARRAY['Food & Beverage'], ARRAY['Electron','React','SQLite'], ARRAY['Billing','Operations'],
    ARRAY['Offline mode','Thermal printing'],
    'Windows 10+ or Android 9+', 'Install the desktop package and pair the thermal printer.',
    'Faster billing screen and Zomato/Swiggy order sync.',
    ARRAY['pos','restaurant billing'], 'Under 12 hours', 3
  UNION ALL SELECT
    'Vala HR Manager', 'vala-hr-manager', 'software',
    'Payroll, attendance and workforce management',
    'Vala HR Manager automates payroll runs, statutory compliance, biometric attendance, leave policies and employee self-service.',
    (SELECT id FROM public.business_categories WHERE name='Human Resources'),
    (SELECT id FROM public.business_subcategories WHERE name='Payroll'),
    'subscription', 749, 69, 'active',
    '["Automated payroll","Statutory compliance","Biometric attendance","Leave policies","Employee self-service"]'::jsonb,
    ARRAY['hr','payroll'], 'v2.4.0',
    'live', 'https://demo.softwarevala.com/hr', 'https://docs.softwarevala.com/hr', 'https://support.softwarevala.com',
    'Vala HR Manager — Payroll & Attendance', 'Run payroll, track attendance and manage compliance from one HR console.',
    ARRAY['hr software','payroll'],
    false, true, false, true, 'commercial', 'professional',
    'intermediate', ARRAY['Services','Manufacturing'], ARRAY['React','Node.js'], ARRAY['HR','Compliance'],
    ARRAY['Payslip generator','Shift planner'],
    '2 vCPU, 4GB RAM', 'Cloud provisioning with company onboarding wizard.',
    'New shift planner and payslip templates.',
    ARRAY['payroll','attendance'], 'Under 8 hours', 4
  UNION ALL SELECT
    'Vala Inventory Tracker', 'vala-inventory-tracker', 'software',
    'Stock, warehouse and barcode management',
    'Vala Inventory Tracker gives real-time stock visibility, barcode scanning, batch and expiry tracking, reorder alerts and multi-warehouse transfers.',
    (SELECT id FROM public.business_categories WHERE name='Retail & POS'),
    (SELECT id FROM public.business_subcategories WHERE name='Inventory Management'),
    'one_time', 449, 0, 'active',
    '["Barcode scanning","Batch & expiry","Reorder alerts","Multi-warehouse transfers"]'::jsonb,
    ARRAY['inventory','warehouse'], 'v1.8.0',
    'live', 'https://demo.softwarevala.com/inventory', 'https://docs.softwarevala.com/inventory', 'https://support.softwarevala.com',
    'Vala Inventory Tracker — Stock Control', 'Track stock, batches and warehouse transfers with barcode support.',
    ARRAY['inventory software','stock management'],
    false, false, true, true, 'commercial', 'standard',
    'basic', ARRAY['Retail','Distribution'], ARRAY['React','PostgreSQL'], ARRAY['Operations'],
    ARRAY['Reorder automation','Stock audit'],
    '2 vCPU, 4GB RAM', 'Import item master via CSV and map warehouses.',
    'Added stock audit mode and label printing.',
    ARRAY['inventory','stock'], 'Under 12 hours', 5
  UNION ALL SELECT
    'Vala Accounting Suite', 'vala-accounting-suite', 'software',
    'GST-ready accounting and compliance',
    'Vala Accounting Suite covers ledgers, GST filings, bank reconciliation, e-invoicing and financial statements for accountants and SMBs.',
    (SELECT id FROM public.business_categories WHERE name='Finance & Accounting'),
    (SELECT id FROM public.business_subcategories WHERE name='GST & Billing'),
    'subscription', 999, 89, 'active',
    '["GST filing","E-invoicing","Bank reconciliation","Financial statements"]'::jsonb,
    ARRAY['accounting','gst'], 'v3.0.4',
    'live', 'https://demo.softwarevala.com/accounting', 'https://docs.softwarevala.com/accounting', 'https://support.softwarevala.com',
    'Vala Accounting Suite — GST Accounting', 'Ledgers, GST returns, e-invoicing and reconciliation in one accounting suite.',
    ARRAY['accounting software','gst filing'],
    false, true, false, true, 'commercial', 'professional',
    'intermediate', ARRAY['Services','Retail'], ARRAY['React','Node.js','PostgreSQL'], ARRAY['Finance'],
    ARRAY['Auto reconciliation','Audit ready reports'],
    '2 vCPU, 4GB RAM', 'Connect bank feeds and import chart of accounts.',
    'E-invoice IRN generation and faster reconciliation.',
    ARRAY['accounting','gst'], 'Under 8 hours', 6
  UNION ALL SELECT
    'Vala Clinic Suite', 'vala-clinic-suite', 'software',
    'Appointments, prescriptions and billing for clinics',
    'Vala Clinic Suite manages appointments, digital prescriptions, patient records, pharmacy stock and insurance billing for multi-doctor clinics.',
    (SELECT id FROM public.business_categories WHERE name='Healthcare'),
    (SELECT id FROM public.business_subcategories WHERE name='Clinic Management'),
    'subscription', 1199, 109, 'draft',
    '["Appointment scheduling","Digital prescriptions","Patient records","Pharmacy stock","Insurance billing"]'::jsonb,
    ARRAY['healthcare','clinic'], 'v1.2.0',
    'live', 'https://demo.softwarevala.com/clinic', 'https://docs.softwarevala.com/clinic', 'https://support.softwarevala.com',
    'Vala Clinic Suite — Clinic Management', 'Appointments, prescriptions and billing for modern clinics.',
    ARRAY['clinic software','emr'],
    false, true, false, true, 'commercial', 'professional',
    'intermediate', ARRAY['Healthcare'], ARRAY['React','Supabase'], ARRAY['Operations'],
    ARRAY['Teleconsult ready','Prescription templates'],
    '2 vCPU, 4GB RAM', 'Configure doctors, rooms and consultation fees.',
    'Initial public beta with teleconsultation.',
    ARRAY['clinic','emr'], 'Under 24 hours', 7
  UNION ALL SELECT
    'Vala School ERP', 'vala-school-erp', 'software',
    'Admissions, fees and academics for schools',
    'Vala School ERP handles admissions, fee collection, timetables, exams, report cards and parent communication for K-12 institutions.',
    (SELECT id FROM public.business_categories WHERE name='Education'),
    (SELECT id FROM public.business_subcategories WHERE name='School ERP'),
    'subscription', 1099, 99, 'parked',
    '["Admissions","Fee collection","Timetable","Exams & report cards","Parent portal"]'::jsonb,
    ARRAY['education','school'], 'v2.0.1',
    'live', 'https://demo.softwarevala.com/school', 'https://docs.softwarevala.com/school', 'https://support.softwarevala.com',
    'Vala School ERP — School Management', 'Admissions, fees, exams and parent communication for schools.',
    ARRAY['school erp','education software'],
    false, true, false, true, 'commercial', 'standard',
    'basic', ARRAY['Education'], ARRAY['React','PostgreSQL'], ARRAY['Administration'],
    ARRAY['Fee reminders','Report card designer'],
    '2 vCPU, 4GB RAM', 'Import student master and configure fee heads.',
    'Parent portal redesign and exam grading rules.',
    ARRAY['school','education'], 'Under 24 hours', 8
) AS seed;

INSERT INTO public.product_demo_mappings (product_id, demo_id)
SELECT p.product_id, d.id FROM public.products p JOIN public.demos d ON d.url = p.demo_url;

INSERT INTO public.product_pricing_plans (product_id, name, model, price, currency, billing_cycle, tier_level, country, features, is_active)
SELECT p.product_id, v.name, v.model, v.price, v.currency, v.cycle, v.tier, v.country, v.features, true
FROM public.products p
JOIN (VALUES
  ('Vala CRM Pro','Basic Plan','subscription',29::numeric,'USD','monthly',1,NULL::text,ARRAY['5 Users','Basic Support']),
  ('Vala CRM Pro','Pro Plan','subscription',99,'USD','monthly',2,NULL,ARRAY['25 Users','Priority Support','API Access']),
  ('Vala CRM Pro','Enterprise','subscription',299,'USD','monthly',3,NULL,ARRAY['Unlimited Users','Dedicated Support','Custom Integrations']),
  ('Vala CRM Pro','India Pricing','country_based',2499,'INR','monthly',NULL,'IN',ARRAY['All Pro Features']),
  ('Vala HR Manager','Lifetime License','one_time',749,'USD',NULL,NULL,NULL,ARRAY['Lifetime Updates','Priority Support']),
  ('Vala ERP Suite','Growth','subscription',149,'USD','monthly',1,NULL,ARRAY['10 Users','All core modules']),
  ('Vala ERP Suite','Enterprise','subscription',499,'USD','monthly',2,NULL,ARRAY['Unlimited Users','Manufacturing module','Dedicated CSM']),
  ('Vala Restaurant POS','Single Outlet','one_time',599,'USD',NULL,NULL,NULL,ARRAY['1 Outlet','Lifetime updates'])
) AS v(product, name, model, price, currency, cycle, tier, country, features) ON v.product = p.product_name;

INSERT INTO public.product_inventory (product_id, stock_type, total_stock, available_stock, reserved, low_threshold, auto_restock, forecast_note)
SELECT p.product_id, v.stock_type, v.total, v.avail, v.reserved, v.low, v.auto, v.note
FROM public.products p
JOIN (VALUES
  ('Vala ERP Suite','license',500,342,58,50,true,'Demand expected to increase by 15% next month'),
  ('Vala HR Manager','license',200,45,10,40,true,'Consider restocking within 2 weeks'),
  ('Vala Inventory Tracker','license',100,12,5,20,false,'Urgent: stock will deplete in about 5 days'),
  ('Vala Restaurant POS','unlimited',999,999,0,0,false,'Unlimited digital delivery'),
  ('Vala Accounting Suite','license',300,187,23,30,true,'Healthy stock through the quarter'),
  ('Vala CRM Pro','license',400,265,35,50,true,'Steady demand, no action needed')
) AS v(product, stock_type, total, avail, reserved, low, auto, note) ON v.product = p.product_name;

INSERT INTO public.product_orders (order_number, product_id, product_name, customer_name, customer_email, quantity, total, currency, status, payment_status, license_key, created_at)
SELECT v.num, p.product_id, v.product, v.cname, v.email, v.qty, v.total, 'USD', v.status, v.pay, v.lic, v.created::timestamptz
FROM (VALUES
  ('ORD-2026-001','Vala ERP Suite','Rahul Mehta','rahul@northwindmfg.com',5,7495::numeric,'completed','paid','VERP-8F2K-7T1Q-9XZC','2026-01-08'),
  ('ORD-2026-002','Vala CRM Pro','Sarah Johnson','sarah@brightloop.io',2,1798,'processing','paid',NULL,'2026-01-12'),
  ('ORD-2026-003','Vala Inventory Tracker','Michael Brown','michael@stockflow.co',1,449,'pending','pending',NULL,'2026-01-15'),
  ('ORD-2026-004','Vala Restaurant POS','Emma Wilson','emma@thespicehouse.com',3,1797,'cancelled','refunded',NULL,'2026-01-05'),
  ('ORD-2026-005','Vala HR Manager','Daniel Okafor','daniel@ravenhr.com',4,2996,'completed','paid','VHRM-2K9L-4M7P-1QWE','2026-01-18'),
  ('ORD-2026-006','Vala Accounting Suite','Priya Nair','priya@nairassociates.in',1,999,'confirmed','paid','VACC-7R3D-8N2V-5BXT','2026-01-21')
) AS v(num, product, cname, email, qty, total, status, pay, lic, created)
LEFT JOIN public.products p ON p.product_name = v.product;

INSERT INTO public.product_licenses (license_key, product_id, product_name, domain_bound, user_email, status, locked, expires_at)
SELECT v.key, p.product_id, v.product, v.domain, v.email, v.status, v.locked, v.expires::timestamptz
FROM (VALUES
  ('VERP-8F2K-7T1Q-9XZC','Vala ERP Suite','erp.northwindmfg.com','rahul@northwindmfg.com','active',true,'2027-01-08'),
  ('VCRM-3J8H-2P5S-6LKM','Vala CRM Pro','crm.brightloop.io','sarah@brightloop.io','active',false,'2026-12-31'),
  ('VHRM-2K9L-4M7P-1QWE','Vala HR Manager','hr.ravenhr.com','daniel@ravenhr.com','active',true,'2027-01-18'),
  ('VINV-5C1B-9G4X-3ZDF','Vala Inventory Tracker',NULL,'michael@stockflow.co','suspended',false,'2026-08-15'),
  ('VACC-7R3D-8N2V-5BXT','Vala Accounting Suite','books.nairassociates.in','priya@nairassociates.in','active',false,'2027-01-21')
) AS v(key, product, domain, email, status, locked, expires)
LEFT JOIN public.products p ON p.product_name = v.product;

INSERT INTO public.pm_roles (code, name, level, permissions) VALUES
  ('ROLE-001','Boss Owner',1,'{"view":true,"copy":true,"download":true,"edit":true}'),
  ('ROLE-002','CEO',2,'{"view":true,"copy":true,"download":true,"edit":true}'),
  ('ROLE-003','Product Manager',3,'{"view":true,"copy":true,"download":true,"edit":true}'),
  ('ROLE-004','Developer',4,'{"view":true,"copy":true,"download":false,"edit":false}'),
  ('ROLE-005','Franchise Manager',5,'{"view":true,"copy":false,"download":false,"edit":false}'),
  ('ROLE-006','Reseller',6,'{"view":true,"copy":false,"download":false,"edit":false}'),
  ('ROLE-007','Customer',7,'{"view":true,"copy":false,"download":false,"edit":false}');

INSERT INTO public.pm_country_access (country_code, name, enabled, franchises) VALUES
  ('IN','India',true,12),('US','United States',true,8),('UK','United Kingdom',true,5),
  ('AE','UAE',false,3),('SG','Singapore',true,2),('AU','Australia',false,4);

INSERT INTO public.pm_approvals (reference, type, title, requested_by, requested_at, status, priority, details) VALUES
  ('APR-001','deployment','Deploy Vala ERP Suite v3.2.1 to production','John Dev','2026-01-20 10:00+00','pending','high','Critical ledger fixes and new manufacturing dashboards'),
  ('APR-002','version','Approve Vala CRM Pro v2.9.0 release','Sarah PM','2026-01-20 09:30+00','pending','medium','Dashboard analytics and bulk lead import'),
  ('APR-003','module','Enable reporting module for franchise accounts','Mike Tech','2026-01-19 16:00+00','approved','low','Optional reporting module for franchise partners'),
  ('APR-004','pricing','Approve India country pricing for Vala CRM Pro','Priya Ops','2026-01-18 12:15+00','rejected','medium','INR pricing tier below approved floor price');

INSERT INTO public.pm_servers (code, name, region, status, load) VALUES
  ('SRV-001','Production Server 1','India',  'online', 65),
  ('SRV-002','Production Server 2','US East','online', 42),
  ('SRV-003','Staging Server','India','online', 28),
  ('SRV-004','Dev Server','India','maintenance', 0);

INSERT INTO public.pm_deployments (reference, product_name, version, environment, status, server_code, deployed_at) VALUES
  ('DEP-001','Vala ERP Suite','v3.2.1','production','deployed','SRV-001','2026-01-20 10:30+00'),
  ('DEP-002','Vala CRM Pro','v2.9.0','staging','deploying','SRV-003','2026-01-21 11:00+00'),
  ('DEP-003','Vala HR Manager','v2.4.0','production','deployed','SRV-002','2026-01-19 15:45+00'),
  ('DEP-004','Vala Inventory Tracker','v1.8.0','staging','failed','SRV-003','2026-01-18 09:20+00');

INSERT INTO public.pm_deployment_logs (deployment_reference, level, message, created_at) VALUES
  ('DEP-002','info','Deployment started for Vala CRM Pro v2.9.0','2026-01-21 11:02:45+00'),
  ('DEP-002','info','Pulling latest build from repository','2026-01-21 11:02:50+00'),
  ('DEP-002','info','Build artifact verified successfully','2026-01-21 11:03:15+00'),
  ('DEP-002','warning','High memory usage detected on staging server','2026-01-21 11:03:30+00'),
  ('DEP-002','info','Deploying to staging environment','2026-01-21 11:04:00+00'),
  ('DEP-001','success','Production deployment completed successfully','2026-01-20 10:35:00+00');

INSERT INTO public.pm_builds (reference, name, type, size, status, locked, version, uploaded_at) VALUES
  ('BLD-001','vala-erp-suite-v3.2.1.apk','apk','45.2 MB','ready',true,'v3.2.1','2026-01-20'),
  ('BLD-002','vala-crm-pro-v2.9.0.apk','apk','32.8 MB','ready',false,'v2.9.0','2026-01-19'),
  ('BLD-003','vala-erp-web-v3.2.1.zip','web','128 MB','ready',true,'v3.2.1','2026-01-20'),
  ('BLD-004','vala-crm-web-v2.9.0.zip','web','98 MB','processing',false,'v2.9.0','2026-01-19'),
  ('BLD-005','vala-brand-assets-v1.0.zip','assets','256 MB','ready',false,'v1.0','2026-01-10'),
  ('BLD-006','vala-icon-pack-v2.0.zip','assets','45 MB','ready',false,'v2.0','2026-01-12');

INSERT INTO public.pm_build_versions (reference, version, released_on, changes, author) VALUES
  ('VER-001','v3.2.1','2026-01-20','Ledger engine performance fixes','Dev Team'),
  ('VER-002','v3.2.0','2026-01-10','New manufacturing dashboards','Dev Team'),
  ('VER-003','v3.1.0','2026-01-04','Purchase workflow API enhancements','Dev Team'),
  ('VER-004','v3.0.0','2025-12-20','Major release with redesigned UI','Dev Team');

INSERT INTO public.pm_modules (reference, name, type, status, locked, role_restricted) VALUES
  ('MOD-001','User Authentication','core','active',false,false),
  ('MOD-002','Dashboard Analytics','core','active',true,false),
  ('MOD-003','Report Generator','optional','active',false,true),
  ('MOD-004','API Integration','optional','disabled',false,false),
  ('MOD-005','Admin Panel','role','active',true,true),
  ('MOD-006','Backup System','core','active',false,false),
  ('MOD-007','Email Notifications','optional','disabled',false,false),
  ('MOD-008','Multi-Language','optional','active',false,false);

INSERT INTO public.pm_api_keys (reference, name, key_preview, status, last_used_at, created_at) VALUES
  ('API-001','Production API Key','sk_live_****4567','active','2026-01-21 08:12+00','2026-01-01 00:00+00'),
  ('API-002','Staging API Key','sk_test_****8901','active','2026-01-20 17:40+00','2026-01-05 00:00+00'),
  ('API-003','Development Key','sk_dev_****2345','revoked','2026-01-10 09:05+00','2025-12-01 00:00+00');

INSERT INTO public.pm_abuse_alerts (reference, type, product_name, ip_address, severity, detected_at, resolved) VALUES
  ('ABU-001','rate_limit','Vala ERP Suite','192.168.1.***','high','2026-01-21 10:30+00',false),
  ('ABU-002','invalid_license','Vala CRM Pro','10.0.0.***','medium','2026-01-19 15:20+00',true),
  ('ABU-003','suspicious_access','Vala HR Manager','172.16.0.***','low','2026-01-17 09:00+00',true);

INSERT INTO public.pm_product_performance (product_name, sales, change_percent) VALUES
  ('Vala ERP Suite',245,12.5),('Vala HR Manager',189,8.3),('Vala Inventory Tracker',156,-2.1),
  ('Vala Restaurant POS',134,15.8),('Vala Accounting Suite',98,5.4);

INSERT INTO public.pm_demo_funnel (stage, count, display_order) VALUES
  ('Demo Views',1250,1),('Started Demo',875,2),('Completed Demo',438,3),('Requested Quote',175,4),('Converted',88,5);

INSERT INTO public.pm_country_sales (country, sales) VALUES
  ('United States',1245),('United Kingdom',567),('Germany',423),('India',389),
  ('Canada',312),('Australia',287),('Others',320);

INSERT INTO public.pm_software_profiles (reference, name, version, status, description, modules, ownership, deployed_to, active_users) VALUES
  ('SW-001','Vala ERP Suite','v3.2.1','active','Complete enterprise resource planning platform with finance, HR, inventory, CRM, analytics and reporting modules.',
   ARRAY['Finance','HR','Inventory','CRM','Analytics','Reports'],'Software Vala',45,1250);

INSERT INTO public.pm_settings (key, value) VALUES
  ('general','{"default_currency":"USD","default_status":"draft","auto_slug":true,"require_approval":true}'),
  ('notifications','{"low_stock_alerts":true,"approval_emails":true,"deployment_alerts":true}');