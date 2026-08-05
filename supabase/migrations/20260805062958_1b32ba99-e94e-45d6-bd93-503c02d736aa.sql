CREATE TABLE public.product_micro_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id uuid NOT NULL REFERENCES public.business_subcategories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subcategory_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_micro_categories TO anon, authenticated;
GRANT ALL ON public.product_micro_categories TO service_role;
ALTER TABLE public.product_micro_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "child panel manage product_micro_categories" ON public.product_micro_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_product_micro_categories_updated BEFORE UPDATE ON public.product_micro_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.product_nano_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  micro_category_id uuid NOT NULL REFERENCES public.product_micro_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (micro_category_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_nano_categories TO anon, authenticated;
GRANT ALL ON public.product_nano_categories TO service_role;
ALTER TABLE public.product_nano_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "child panel manage product_nano_categories" ON public.product_nano_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_product_nano_categories_updated BEFORE UPDATE ON public.product_nano_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
DECLARE
  table_name text;
  tables text[] := ARRAY[
    'business_categories','business_subcategories','demos','products','product_demo_mappings',
    'product_inventory','product_licenses','product_orders','product_pricing_plans','product_action_logs',
    'pm_abuse_alerts','pm_api_keys','pm_approvals','pm_build_versions','pm_builds','pm_country_access',
    'pm_country_sales','pm_demo_funnel','pm_deployment_logs','pm_deployments','pm_modules',
    'pm_product_performance','pm_roles','pm_servers','pm_settings','pm_software_profiles'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true)', 'child panel anon manage ' || table_name, table_name);
  END LOOP;
END $$;

CREATE INDEX idx_product_micro_categories_subcategory ON public.product_micro_categories(subcategory_id, display_order);
CREATE INDEX idx_product_nano_categories_micro ON public.product_nano_categories(micro_category_id, display_order);