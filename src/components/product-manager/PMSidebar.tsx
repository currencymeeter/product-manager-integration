import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  MonitorPlay,
  DollarSign,
  Warehouse,
  ShoppingCart,
  BarChart3,
  Activity,
  Settings,
  ChevronRight,
  ChevronDown,
  Layers,
  Grid3X3,
  Microscope,
  Atom,
  Lock,
  Shield,
  Cpu,
  Server,
  Eye,
  Copy,
  Download,
  Edit3,
  Globe2,
  Upload,
  FileCode,
  Archive,
  Rocket,
  GitBranch,
  RotateCcw,
  StopCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
  Zap,
  Key,
  Link2,
  Timer,
  ShieldAlert,
  History,
  ClipboardList,
  Bell,
  User,
  Box,
  Code,
  ToggleLeft,
  UserCheck,
} from 'lucide-react';

interface PMSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  stats?: {
    totalProducts: number;
    activeDemos: number;
    pendingOrders: number;
    pendingDeployments?: number;
    criticalIssues?: number;
  };
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  children?: { id: string; label: string; icon: React.ElementType; badge?: number | string }[];
  locked?: boolean;
}

const menuItems: MenuItem[] = [
  // 1. DASHBOARD
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  
  // 2. SOFTWARE PRODUCTS (CORE)
  { 
    id: 'software-products', 
    label: 'Software Products', 
    icon: Package,
    children: [
      { id: 'all-products', label: 'All Software', icon: Box },
      { id: 'active-products', label: 'Active', icon: CheckCircle2 },
      { id: 'development-products', label: 'In Development', icon: Code },
      { id: 'deployed-products', label: 'Deployed', icon: Rocket },
      { id: 'locked-products', label: 'Locked', icon: Lock },
      { id: 'archived-products', label: 'Archived', icon: Archive },
      { id: 'software-profile', label: 'Software Profile', icon: FileText },
    ]
  },

  // 2b. COMMERCE & SALES
  {
    id: 'commerce',
    label: 'Commerce & Sales',
    icon: BarChart3,
    children: [
      { id: 'pricing-plans', label: 'Pricing Plans', icon: Layers },
      { id: 'inventory', label: 'Inventory', icon: Package },
      { id: 'orders', label: 'Orders', icon: Box },
      { id: 'licenses', label: 'License Manager', icon: Key },
      { id: 'demo-management', label: 'Demo Management', icon: Eye },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ]
  },

  // 3. PRODUCT STRUCTURE (MANDATORY HIERARCHY)
  { 
    id: 'product-structure', 
    label: 'Product Structure', 
    icon: FolderTree,
    children: [
      { id: 'main-category', label: 'Category', icon: Layers },
      { id: 'sub-category', label: 'Sub-Category', icon: Grid3X3 },
      { id: 'micro-category', label: 'Micro-Category', icon: Microscope },
      { id: 'nano-category', label: 'Nano-Category', icon: Atom },
      { id: 'feature-binding', label: 'Feature Binding', icon: Link2 },
    ]
  },
  
  // 4. MODULE MANAGEMENT
  { 
    id: 'module-management', 
    label: 'Module Management', 
    icon: Cpu,
    children: [
      { id: 'core-modules', label: 'Core Modules', icon: Cpu },
      { id: 'optional-modules', label: 'Optional Modules', icon: ToggleLeft },
      { id: 'role-modules', label: 'Role-Based Modules', icon: UserCheck },
      { id: 'locked-modules', label: 'Locked Modules', icon: Lock },
      { id: 'disabled-modules', label: 'Disabled Modules', icon: StopCircle },
    ]
  },
  
  // 5. ACCESS & CONTROL (CRITICAL)
  { 
    id: 'access-control', 
    label: 'Access & Control', 
    icon: Shield,
    children: [
      { id: 'view-permission', label: 'View Permission', icon: Eye },
      { id: 'copy-permission', label: 'Copy Permission', icon: Copy },
      { id: 'download-permission', label: 'Download Permission', icon: Download },
      { id: 'edit-permission', label: 'Edit Permission', icon: Edit3 },
      { id: 'role-visibility', label: 'Role Visibility', icon: UserCheck },
      { id: 'country-control', label: 'Country/Franchise', icon: Globe2 },
    ]
  },
  
  // 6. FILE & BUILD MANAGEMENT
  { 
    id: 'file-build', 
    label: 'File & Build', 
    icon: FileCode,
    children: [
      { id: 'upload-build', label: 'Upload Build Files', icon: Upload },
      { id: 'apk-builds', label: 'APK Builds', icon: Package },
      { id: 'web-builds', label: 'Web Builds', icon: Globe2 },
      { id: 'assets', label: 'Assets', icon: Archive },
      { id: 'file-lock', label: 'File Lock', icon: Lock },
      { id: 'view-only-mode', label: 'View-Only Mode', icon: Eye },
      { id: 'version-history', label: 'Version History', icon: History },
    ]
  },
  
  // 7. DEPLOYMENT CONTROL
  { 
    id: 'deployment-control', 
    label: 'Deployment Control', 
    icon: Rocket,
    children: [
      { id: 'server-assignment', label: 'Server Assignment', icon: Server },
      { id: 'environment-select', label: 'Environment Select', icon: GitBranch },
      { id: 'deploy', label: 'Deploy', icon: Rocket },
      { id: 'rollback', label: 'Rollback', icon: RotateCcw },
      { id: 'stop-deployment', label: 'Stop Deployment', icon: StopCircle },
      { id: 'deployment-logs', label: 'Deployment Logs', icon: FileText },
    ]
  },
  
  // 8. APPROVAL FLOW (INTERNAL)
  { 
    id: 'approval-flow', 
    label: 'Approval Flow', 
    icon: CheckCircle2,
    children: [
      { id: 'deployment-approval', label: 'Deployment Approval', icon: Rocket },
      { id: 'version-approval', label: 'Version Approval', icon: GitBranch },
      { id: 'module-approval', label: 'Module Approval', icon: Cpu },
      { id: 'emergency-override', label: 'Emergency Override', icon: AlertCircle },
    ]
  },
  
  // 9. SECURITY & LICENSE
  { 
    id: 'security-license', 
    label: 'Security & License', 
    icon: ShieldAlert,
    children: [
      { id: 'license-lock', label: 'License Lock', icon: Lock },
      { id: 'domain-lock', label: 'Domain Lock', icon: Globe2 },
      { id: 'api-key-binding', label: 'API Key Binding', icon: Key },
      { id: 'expiry-control', label: 'Expiry Control', icon: Timer },
      { id: 'abuse-protection', label: 'Abuse Protection', icon: ShieldAlert },
    ]
  },
  
  // 10. ACTIVITY & AUDIT LOGS
  { 
    id: 'activity-logs', 
    label: 'Activity & Audit', 
    icon: Activity,
    children: [
      { id: 'product-changes', label: 'Product Changes', icon: Edit3 },
      { id: 'file-upload-logs', label: 'File Upload Logs', icon: Upload },
      { id: 'lock-unlock-history', label: 'Lock/Unlock History', icon: Lock },
      { id: 'deployment-history', label: 'Deployment History', icon: Rocket },
      { id: 'approval-history', label: 'Approval History', icon: CheckCircle2 },
    ]
  },
  
  // 11. REPORTS
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: BarChart3,
    children: [
      { id: 'software-usage', label: 'Software Usage', icon: BarChart3 },
      { id: 'deployment-success', label: 'Deployment Success', icon: CheckCircle2 },
      { id: 'failure-reports', label: 'Failure Reports', icon: AlertCircle },
      { id: 'export-reports', label: 'Export (Admin)', icon: Download },
    ]
  },
  
  // 12. SETTINGS (LIMITED)
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings,
    children: [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'security-settings', label: 'Security', icon: Shield },
      { id: 'profile', label: 'Profile', icon: User },
    ]
  },
];

const COLLAPSE_KEY = 'sv:pm-sidebar:collapsed';

const PMSidebar: React.FC<PMSidebarProps> = ({ activeSection, onSectionChange, stats }) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['software-products']);
  const [collapsed, setCollapsed] = React.useState(false);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isActive = (id: string) => activeSection === id;
  const isChildActive = (item: MenuItem) =>
    item.children?.some(child => activeSection === child.id);

  const handleItemClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpand(item.id);
    } else {
      onSectionChange(item.id);
      toast.success(`Navigated to ${item.label}`, {
        description: 'Section loaded successfully'
      });
    }
  };

  const handleChildClick = (childId: string, childLabel: string) => {
    onSectionChange(childId);
    toast.success(`Navigated to ${childLabel}`, {
      description: 'Section loaded successfully'
    });
  };

  const q = query.trim().toLowerCase();
  const visibleItems = React.useMemo(() => {
    if (!q) return menuItems;
    return menuItems
      .map((item) => {
        if (!item.children) {
          return item.label.toLowerCase().includes(q) ? item : null;
        }
        const kids = item.children.filter((c) => c.label.toLowerCase().includes(q));
        if (item.label.toLowerCase().includes(q)) return item;
        return kids.length > 0 ? { ...item, children: kids } : null;
      })
      .filter(Boolean) as MenuItem[];
  }, [q]);

  return (
    <aside
      className={cn(
        'flex flex-col shrink-0 h-full border-r border-border bg-background/80 backdrop-blur-xl transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-[264px]'
      )}
    >
      {/* Brand header */}
      <div
        className={cn(
          'flex h-16 items-center gap-2 border-b border-border px-3 shrink-0',
          collapsed && 'justify-center px-0'
        )}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold text-xs">
          SV
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Software Vala</p>
            <p className="truncate text-[11px] text-muted-foreground">Product Manager</p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={toggleCollapsed}
            className="ml-auto grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="mx-auto mt-3 grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {!collapsed && (
        <>
          <div className="px-3 pt-3 shrink-0">
            <div className="focus-glow flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a section…"
                className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {stats && (
            <div className="px-3 pt-3 grid grid-cols-3 gap-2 shrink-0">
              <div className="rounded-xl border border-border bg-surface px-2 py-1.5 text-center">
                <p className="text-sm font-bold text-primary-glow">{stats.totalProducts}</p>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Products</p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-2 py-1.5 text-center">
                <p className="text-sm font-bold text-accent-amber">{stats.pendingDeployments || 0}</p>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Pending</p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-2 py-1.5 text-center">
                <p className="text-sm font-bold text-accent-pink">{stats.criticalIssues || 0}</p>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Critical</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="px-2 py-3 space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = !!item.children && item.children.length > 0;
            const isExpanded = q ? true : expandedItems.includes(item.id);
            const active = isActive(item.id) || !!isChildActive(item);

            if (!hasChildren) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  data-testid={`pm-nav-${item.id}`}
                  title={item.label}
                  className={cn(
                    'group/item relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors duration-150',
                    collapsed && 'justify-center px-0',
                    active
                      ? 'bg-primary/18 text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary" />
                  )}
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            }

            if (collapsed) {
              return (
                <div key={item.id} className="space-y-0.5 border-t border-border/60 pt-2">
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <button
                        key={child.id}
                        onClick={() => handleChildClick(child.id, child.label)}
                        data-testid={`pm-nav-${child.id}`}
                        title={child.label}
                        className={cn(
                          'relative flex w-full items-center justify-center rounded-xl py-2 transition-colors',
                          isActive(child.id)
                            ? 'bg-primary/18 text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                        )}
                      >
                        <ChildIcon className="h-4 w-4 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              );
            }

            return (
              <div key={item.id}>
                <button
                  onClick={() => handleItemClick(item)}
                  data-testid={`pm-nav-${item.id}`}
                  aria-expanded={isExpanded}
                  aria-controls={`pm-nav-group-${item.id}`}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', isExpanded && 'rotate-180')}
                  />
                </button>

                {isExpanded && (
                  <motion.div
                    id={`pm-nav-group-${item.id}`}
                    data-testid={`pm-nav-group-${item.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.12 }}
                    className="mt-0.5 space-y-0.5"
                  >
                    {item.children?.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.id);
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleChildClick(child.id, child.label)}
                          data-testid={`pm-nav-${child.id}`}
                          title={child.label}
                          className={cn(
                            'relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors duration-150',
                            childActive
                              ? 'bg-primary/18 text-foreground font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                          )}
                        >
                          {childActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary" />
                          )}
                          <ChildIcon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{child.label}</span>
                          {child.badge && (
                            <Badge variant="secondary" className="ml-auto text-[9px] h-4 px-1.5">
                              {child.badge}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className={cn('shrink-0 border-t border-border px-3 py-2.5', collapsed && 'px-2')}>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Activity className="h-3 w-3 text-accent-emerald animate-pulse shrink-0" />
          {!collapsed && <span className="truncate">System Active • v2.0</span>}
        </div>
      </div>
    </aside>
  );
};

export default PMSidebar;
