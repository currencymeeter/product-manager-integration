import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  usePMData, fetchRoles, updateRolePermissions, fetchCountryAccess, updateCountryAccess,
} from '../data/pmQueries';
import {
  Shield, Eye, Copy, Download, Edit3, UserCheck, Globe2,
  Lock, Unlock, Save, Users, Building2, MapPin
} from 'lucide-react';

interface PMAccessControlProps {
  permissionType: string;
}

interface PMRole {
  id: string;
  code: string;
  name: string;
  level: number;
  permissions: { view: boolean; copy: boolean; download: boolean; edit: boolean };
}

interface PMCountry {
  id: string;
  country_code: string;
  name: string;
  enabled: boolean;
  franchises: number;
}

const PMAccessControl: React.FC<PMAccessControlProps> = ({ permissionType }) => {
  const { data: roleData, refetch: refetchRoles } = usePMData(fetchRoles, []);
  const { data: countryData, refetch: refetchCountries } = usePMData(fetchCountryAccess, []);
  const roles = (roleData ?? []) as PMRole[];
  const countries = (countryData ?? []) as PMCountry[];

  const getTitle = () => {
    switch (permissionType) {
      case 'view-permission': return 'View Permission';
      case 'copy-permission': return 'Copy Permission';
      case 'download-permission': return 'Download Permission';
      case 'edit-permission': return 'Edit Permission';
      case 'role-visibility': return 'Role Visibility';
      case 'country-control': return 'Country/Franchise Control';
      default: return 'Access Control';
    }
  };

  const getIcon = () => {
    switch (permissionType) {
      case 'view-permission': return Eye;
      case 'copy-permission': return Copy;
      case 'download-permission': return Download;
      case 'edit-permission': return Edit3;
      case 'role-visibility': return UserCheck;
      case 'country-control': return Globe2;
      default: return Shield;
    }
  };

  const handlePermissionToggle = async (role: PMRole, permission: keyof PMRole['permissions']) => {
    try {
      await updateRolePermissions(role.id, {
        ...role.permissions,
        [permission]: !role.permissions[permission],
      });
      await refetchRoles();
      toast.success('Permission updated', { description: `${role.name} - ${permission}` });
    } catch {
      toast.error('Failed to update permission');
    }
  };

  const handleCountryToggle = async (country: PMCountry) => {
    try {
      await updateCountryAccess(country.id, !country.enabled);
      await refetchCountries();
      toast.success(`Country ${country.enabled ? 'disabled' : 'enabled'}`, { description: country.name });
    } catch {
      toast.error('Failed to update country access');
    }
  };

  const handleSave = async () => {
    await Promise.all([refetchRoles(), refetchCountries()]);
    toast.success('Permissions saved successfully', {
      description: 'All changes have been applied',
    });
  };

  const Icon = getIcon();

  if (permissionType === 'country-control') {
    return (
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{getTitle()}</h1>
              <p className="text-sm text-muted-foreground">
                Manage country and franchise access
              </p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </motion.div>

        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countries.map((country, index) => (
              <motion.div
                key={country.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`bg-card/50 border-border/50 hover:border-emerald-500/30 transition-all ${!country.enabled && 'opacity-60'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                          <MapPin className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{country.name}</h3>
                          <p className="text-xs text-muted-foreground">{country.country_code}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={country.enabled}
                        onCheckedChange={() => handleCountryToggle(country)}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{country.franchises} Franchises</span>
                      </div>
                      <Badge variant={country.enabled ? 'default' : 'secondary'}>
                        {country.enabled ? 'Active' : 'Disabled'}
                      </Badge>
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

  const permissionKey = permissionType.replace('-permission', '') as 'view' | 'copy' | 'download' | 'edit';

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{getTitle()}</h1>
            <p className="text-sm text-muted-foreground">
              Configure {permissionType.replace('-', ' ')} for each role
            </p>
          </div>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </motion.div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" /> Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="space-y-3">
              {roles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      L{role.level}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch 
                      checked={role.permissions[permissionKey]}
                      onCheckedChange={() => handlePermissionToggle(role, permissionKey)}
                    />
                    <Badge variant={role.permissions[permissionKey] ? 'default' : 'secondary'}>
                      {role.permissions[permissionKey] ? 'Allowed' : 'Denied'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default PMAccessControl;
