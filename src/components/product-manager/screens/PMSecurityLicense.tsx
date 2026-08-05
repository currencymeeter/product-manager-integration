import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { fetchAbuseAlerts, fetchApiKeys, fetchLicenses, resolveAbuseAlert, updateApiKey, updateLicense, usePMData } from '../data/pmQueries';
import {
  Lock, Unlock, Globe2, Key, Timer, ShieldAlert, Shield,
  Eye, Edit3, Copy, AlertTriangle, CheckCircle2, XCircle, Calendar
} from 'lucide-react';

interface PMSecurityLicenseProps {
  securityType: string;
}

const PMSecurityLicense: React.FC<PMSecurityLicenseProps> = ({ securityType }) => {
  const licenseData = usePMData(fetchLicenses);
  const apiKeyData = usePMData(fetchApiKeys);
  const abuseData = usePMData(fetchAbuseAlerts);
  const licenses = (licenseData.data || []).map((l: any) => ({ ...l, product: l.product_name, key: l.license_key, domain: l.domain_bound, expiresAt: l.expires_at ? new Date(l.expires_at).toLocaleDateString() : 'Never' }));
  const apiKeys = (apiKeyData.data || []).map((k: any) => ({ ...k, key: k.key_preview, createdAt: new Date(k.created_at).toLocaleDateString(), lastUsed: k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never' }));
  const abuseAlerts = (abuseData.data || []).map((a: any) => ({ ...a, product: a.product_name, ip: a.ip_address, detected: new Date(a.detected_at).toLocaleString() }));

  const getTitle = () => {
    switch (securityType) {
      case 'license-lock': return 'License Lock';
      case 'domain-lock': return 'Domain Lock';
      case 'api-key-binding': return 'API Key Binding';
      case 'expiry-control': return 'Expiry Control';
      case 'abuse-protection': return 'Abuse Protection';
      default: return 'Security & License';
    }
  };

  const getIcon = () => {
    switch (securityType) {
      case 'license-lock': return Lock;
      case 'domain-lock': return Globe2;
      case 'api-key-binding': return Key;
      case 'expiry-control': return Timer;
      case 'abuse-protection': return ShieldAlert;
      default: return Shield;
    }
  };

  const handleAction = async (action: string, item: any) => {
    try {
      if (action === 'Copy') await navigator.clipboard.writeText(item.key);
      if (action === 'Revoke') { await updateApiKey(item.id, { status: 'revoked' }); await apiKeyData.refetch(); }
      toast.success(action === 'Revoke' ? 'API key revoked' : 'API key copied');
    } catch { toast.error(`Failed to ${action.toLowerCase()} API key`); }
  };

  const toggleLock = async (licenseId: string) => {
    const license = licenses.find(l => l.id === licenseId);
    if (!license) return;
    try { await updateLicense(licenseId, { locked: !license.locked }); await licenseData.refetch(); toast.success(`License ${license.locked ? 'unlocked' : 'locked'}`); }
    catch { toast.error('Failed to update license lock'); }
  };

  const resolveAlert = async (alertId: string) => {
    try { await resolveAbuseAlert(alertId, true); await abuseData.refetch(); toast.success('Alert resolved'); }
    catch { toast.error('Failed to resolve alert'); }
  };

  const Icon = getIcon();

  if (securityType === 'api-key-binding') {
    return (
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{getTitle()}</h1>
              <p className="text-sm text-muted-foreground">Manage API keys and bindings</p>
            </div>
          </div>
          <Button className="gap-2">
            <Key className="w-4 h-4" /> Generate New Key
          </Button>
        </motion.div>

        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="space-y-3">
            {apiKeys.map((key, index) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-card/50 border-border/50 hover:border-violet-500/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-sm">{key.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{key.key}</p>
                      </div>
                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                        {key.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created: {key.createdAt}</span>
                      <span>Last used: {key.lastUsed}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-3">
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => handleAction('Copy', key)}>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-red-400" onClick={() => handleAction('Revoke', key)}>
                        <XCircle className="w-3.5 h-3.5" /> Revoke
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (securityType === 'abuse-protection') {
    return (
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{getTitle()}</h1>
            <p className="text-sm text-muted-foreground">Monitor and resolve abuse alerts</p>
          </div>
        </motion.div>

        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="space-y-3">
            {abuseAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`bg-card/50 border-border/50 ${!alert.resolved ? 'border-l-4 border-l-red-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'high' ? 'text-red-400' :
                          alert.severity === 'medium' ? 'text-amber-400' : 'text-blue-400'
                        }`} />
                        <div>
                          <h3 className="font-medium text-sm capitalize">{alert.type.replace('_', ' ')}</h3>
                          <p className="text-xs text-muted-foreground">{alert.product} • IP: {alert.ip}</p>
                        </div>
                      </div>
                      <Badge variant={alert.resolved ? 'secondary' : 'destructive'}>
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Detected: {alert.detected}</span>
                      {!alert.resolved && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => resolveAlert(alert.id)}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // License Lock, Domain Lock, Expiry Control views
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{getTitle()}</h1>
          <p className="text-sm text-muted-foreground">Manage licenses and security</p>
        </div>
      </motion.div>

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-3">
          {licenses.map((license, index) => (
            <motion.div
              key={license.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card/50 border-border/50 hover:border-amber-500/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${license.locked ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                        {license.locked ? <Lock className="w-5 h-5 text-amber-400" /> : <Unlock className="w-5 h-5 text-emerald-400" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{license.product}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{license.key}</p>
                      </div>
                    </div>
                    <Badge variant={license.status === 'active' ? 'default' : 'secondary'}>
                      {license.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                    {securityType === 'domain-lock' && (
                      <div>
                        <span className="text-muted-foreground">Domain</span>
                        <p className="font-medium">{license.domain || 'Not bound'}</p>
                      </div>
                    )}
                    {securityType === 'expiry-control' && (
                      <div>
                        <span className="text-muted-foreground">Expires</span>
                        <p className="font-medium">{license.expiresAt}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => handleAction('View', license.product)}>
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => handleAction('Edit', license.product)}>
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => toggleLock(license.id)}>
                      {license.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {license.locked ? 'Unlock' : 'Lock'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PMSecurityLicense;
