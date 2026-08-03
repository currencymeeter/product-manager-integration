import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  usePMData, fetchServers, fetchDeployments, fetchDeploymentLogs, fetchProductOptions,
  insertDeployment, insertDeploymentLog, updateDeployment,
} from '../data/pmQueries';
import {
  Rocket, Server, GitBranch, RotateCcw, StopCircle, FileText,
  CheckCircle2, Clock, AlertCircle, Play, Pause, RefreshCw,
  Globe2, Database, Cpu, Activity
} from 'lucide-react';

interface PMDeploymentControlProps {
  deploymentType: string;
}

const PMDeploymentControl: React.FC<PMDeploymentControlProps> = ({ deploymentType }) => {
  const [selectedServer, setSelectedServer] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('staging');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);

  const { data: serverData } = usePMData(fetchServers, []);
  const { data: deploymentData, refetch: refetchDeployments } = usePMData(fetchDeployments, []);
  const { data: logData, refetch: refetchLogs } = usePMData(fetchDeploymentLogs, []);
  const { data: productData } = usePMData(fetchProductOptions, []);

  const servers = ((serverData ?? []) as any[]).map(s => ({
    id: s.id, code: s.code, name: s.name, region: s.region, status: s.status, load: s.load,
  }));
  const deployments = ((deploymentData ?? []) as any[]).map(d => ({
    id: d.id,
    reference: d.reference,
    product: d.product_name,
    version: d.version,
    environment: d.environment,
    status: d.status,
    server: d.server_code,
    deployedAt: new Date(d.deployed_at).toLocaleString(),
  }));
  const logs = ((logData ?? []) as any[]).map(l => ({
    id: l.id,
    timestamp: new Date(l.created_at).toLocaleString(),
    level: l.level,
    message: l.message,
  }));
  const products = ((productData ?? []) as any[]);

  const getTitle = () => {
    switch (deploymentType) {
      case 'server-assignment': return 'Server Assignment';
      case 'environment-select': return 'Environment Select';
      case 'deploy': return 'Deploy';
      case 'rollback': return 'Rollback';
      case 'stop-deployment': return 'Stop Deployment';
      case 'deployment-logs': return 'Deployment Logs';
      default: return 'Deployment Control';
    }
  };

  const handleDeploy = async () => {
    const product = products.find(p => p.product_id === selectedProduct);
    const server = servers.find(s => s.id === selectedServer);
    if (!product || !server) {
      toast.error('Select a product and a target server');
      return;
    }
    setDeploying(true);
    setDeployProgress(10);
    const reference = `DEP-${Date.now().toString(36).toUpperCase()}`;
    try {
      await insertDeployment({
        reference,
        product_name: product.product_name,
        version: product.version,
        environment: selectedEnv,
        status: 'deploying',
        server_code: server.code,
        deployed_at: new Date().toISOString(),
      });
      await insertDeploymentLog({
        deployment_reference: reference,
        level: 'info',
        message: `Deployment started for ${product.product_name} ${product.version} on ${server.name}`,
      });
      setDeployProgress(60);
      await refetchDeployments();
      const created = ((await fetchDeployments()) as any[]).find(d => d.reference === reference);
      if (created) {
        await updateDeployment(created.id, { status: 'deployed' });
        await insertDeploymentLog({
          deployment_reference: reference,
          level: 'success',
          message: `Deployment completed for ${product.product_name} ${product.version}`,
        });
      }
      setDeployProgress(100);
      await Promise.all([refetchDeployments(), refetchLogs()]);
      toast.success('Deployment completed successfully');
    } catch {
      await insertDeploymentLog({
        deployment_reference: reference,
        level: 'error',
        message: 'Deployment failed',
      }).catch(() => undefined);
      await refetchLogs();
      toast.error('Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const handleAction = async (action: string, deployment: { id: string; reference: string; product: string }) => {
    try {
      if (action === 'Rollback') {
        await updateDeployment(deployment.id, { status: 'rolled-back' });
        await insertDeploymentLog({
          deployment_reference: deployment.reference,
          level: 'warning',
          message: `Rollback executed for ${deployment.product}`,
        });
      } else if (action === 'Stop') {
        await updateDeployment(deployment.id, { status: 'stopped' });
        await insertDeploymentLog({
          deployment_reference: deployment.reference,
          level: 'warning',
          message: `Deployment stopped for ${deployment.product}`,
        });
      }
      await Promise.all([refetchDeployments(), refetchLogs()]);
      toast.success(`${action} completed`, { description: deployment.product });
    } catch {
      toast.error(`${action} failed`);
    }
  };

  if (deploymentType === 'deployment-logs') {
    return (
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{getTitle()}</h1>
              <p className="text-sm text-muted-foreground">Real-time deployment logs</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => refetchLogs()}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </motion.div>

        <Card className="bg-slate-950 border-slate-800">
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="p-4 font-mono text-xs space-y-1">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-slate-500">{log.timestamp}</span>
                    <span className={
                      log.level === 'success' ? 'text-emerald-400' :
                      log.level === 'warning' ? 'text-amber-400' :
                      log.level === 'error' ? 'text-red-400' : 'text-slate-300'
                    }>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (deploymentType === 'server-assignment') {
    return (
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{getTitle()}</h1>
            <p className="text-sm text-muted-foreground">Assign products to servers</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servers.map((server, index) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`bg-card/50 border-border/50 hover:border-cyan-500/30 transition-all cursor-pointer ${selectedServer === server.id ? 'border-cyan-500/50 bg-cyan-500/5' : ''}`}
                onClick={() => {
                  setSelectedServer(server.id);
                  toast.success('Server selected', { description: server.name });
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${server.status === 'online' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                        <Server className={`w-5 h-5 ${server.status === 'online' ? 'text-emerald-400' : 'text-amber-400'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{server.name}</h3>
                        <p className="text-xs text-muted-foreground">{server.region}</p>
                      </div>
                    </div>
                    <Badge variant={server.status === 'online' ? 'default' : 'secondary'}>
                      {server.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Load</span>
                      <span>{server.load}%</span>
                    </div>
                    <Progress value={server.load} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (deploymentType === 'deploy') {
    return (
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Deploy Application</h1>
            <p className="text-sm text-muted-foreground">Deploy to production or staging</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">Deployment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Select Product</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.product_id} value={p.product_id}>
                        {p.product_name} {p.version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Environment</label>
                <Select value={selectedEnv} onValueChange={setSelectedEnv}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Target Server</label>
                <Select value={selectedServer} onValueChange={setSelectedServer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose server" />
                  </SelectTrigger>
                  <SelectContent>
                    {servers.filter(s => s.status === 'online').map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleDeploy} disabled={deploying} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Rocket className="w-4 h-4" /> {deploying ? 'Deploying...' : 'Deploy Now'}
              </Button>
            </CardContent>
          </Card>

          {deploying && (
            <Card className="bg-card/50 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Deployment Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={deployProgress} className="h-3" />
                <p className="text-center text-lg font-bold">{deployProgress}%</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Build verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {deployProgress > 30 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span>Uploading to server</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {deployProgress > 60 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span>Running migrations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {deployProgress === 100 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span>Completing deployment</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Default view for rollback, stop-deployment, environment-select
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Rocket className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{getTitle()}</h1>
          <p className="text-sm text-muted-foreground">Manage deployments</p>
        </div>
      </motion.div>

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-3">
          {deployments.map((dep, index) => (
            <motion.div
              key={dep.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card/50 border-border/50 hover:border-violet-500/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        dep.status === 'deployed' ? 'bg-emerald-500/20' :
                        dep.status === 'deploying' ? 'bg-blue-500/20' : 'bg-red-500/20'
                      }`}>
                        <Rocket className={`w-5 h-5 ${
                          dep.status === 'deployed' ? 'text-emerald-400' :
                          dep.status === 'deploying' ? 'text-blue-400' : 'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{dep.product}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{dep.version}</span>
                          <span>•</span>
                          <span>{dep.environment}</span>
                          <span>•</span>
                          <span>{dep.deployedAt}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      dep.status === 'deployed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      dep.status === 'deploying' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }>
                      {dep.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {deploymentType === 'rollback' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-amber-500/30 text-amber-400" onClick={() => handleAction('Rollback', dep)}>
                        <RotateCcw className="w-3.5 h-3.5" /> Rollback
                      </Button>
                    )}
                    {deploymentType === 'stop-deployment' && dep.status === 'deploying' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-500/30 text-red-400" onClick={() => handleAction('Stop', dep)}>
                        <StopCircle className="w-3.5 h-3.5" /> Stop
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => handleAction('View Logs', dep)}>
                      <FileText className="w-3.5 h-3.5" /> Logs
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

export default PMDeploymentControl;
