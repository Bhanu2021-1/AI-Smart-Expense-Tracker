import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Shield, Smartphone, LogOut, CheckCircle2, ChevronRight, Settings, Lock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../components/ui/Badge';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [devices, setDevices] = useState([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setIsLoadingDevices(true);
      const data = await authApi.getDevices();
      setDevices(data);
    } catch (error) {
      showToast('error', 'Failed to load devices');
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const handleDisconnect = async (deviceId) => {
    try {
      await authApi.disconnectDevice(deviceId);
      showToast('success', 'Device disconnected');
      fetchDevices();
    } catch (error) {
      showToast('error', 'Failed to disconnect device');
    }
  };

  const renderRelativeTime = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 relative">
      
      {/* Immersive Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col mb-8 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-extrabold tracking-tight text-white leading-tight"
        >
          Account
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-neutral-400 mt-2 font-medium"
        >
          Manage your identity, security, and connected devices.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Identity */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-8 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-500/20 to-transparent opacity-50" />
               <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-24 h-24 rounded-3xl bg-surface-200/80 border border-white/10 flex items-center justify-center shadow-2xl mb-6 relative group-hover:scale-105 transition-transform duration-500">
                    <User className="w-12 h-12 text-primary-400" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-surface-100 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                 </div>
                 <h2 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h2>
                 <p className="text-neutral-400 mt-1">{user?.email}</p>
                 <Badge variant="success" className="mt-4">Premium Member</Badge>
               </div>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
             <Button variant="destructive" className="w-full h-14 text-base group" onClick={logout}>
               <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
               Sign Out Securely
             </Button>
          </motion.div>
        </div>

        {/* Right Column: Settings & Devices */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6 sm:p-8">
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Personal Details
              </h3>
              <div className="space-y-6">
                <Input label="Full Name" icon={User} value={user?.name || ''} readOnly disabled className="bg-surface-200/30" />
                <Input label="Email Address" icon={Mail} value={user?.email || ''} readOnly disabled className="bg-surface-200/30" />
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-6 sm:p-8">
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Security & Sync
              </h3>
              <div className="space-y-4">
                
                {isLoadingDevices ? (
                  <p className="text-neutral-500 text-sm">Loading devices...</p>
                ) : devices.length > 0 ? (
                  devices.map((device) => (
                    <div key={device.id} className="group flex items-center justify-between p-4 rounded-2xl border border-white/[0.04] bg-surface-100/50 hover:bg-surface-200/80 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner group-hover:bg-blue-500/20 transition-colors">
                          <Smartphone className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white tracking-wide">{device.deviceName}</p>
                          {device.androidVersion && <p className="text-xs text-neutral-500 mb-1">Android {device.androidVersion}</p>}
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className={`w-2 h-2 rounded-full ${device.syncStatus === 'SYNCED' || device.syncStatus === 'PENDING' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                             <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold">
                               {device.syncStatus === 'SYNCED' ? 'Synced Active' : device.syncStatus}
                             </p>
                             <p className="text-xs text-neutral-500 ml-2">Last Sync: {renderRelativeTime(device.lastSync)}</p>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDisconnect(device.id)}
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                        title="Disconnect Device"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500 text-sm italic">No connected devices.</p>
                )}
                
                <div className="group flex items-center justify-between p-4 rounded-2xl border border-white/[0.04] bg-surface-100/50 hover:bg-surface-200/80 transition-all cursor-pointer mt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shadow-inner group-hover:bg-primary-500/20 transition-colors">
                      <Lock className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white tracking-wide">Change Password</p>
                      <p className="text-xs text-neutral-400 mt-0.5">Last updated 3 months ago</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" />
                </div>

              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
