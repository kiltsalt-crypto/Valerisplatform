import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TwoFactorAuth from './TwoFactorAuth';

export default function Admin2FAEnforcement() {
  const { user } = useAuth();
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [graceUntil, setGraceUntil] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin2FAStatus();
  }, [user]);

  const checkAdmin2FAStatus = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('requires_2fa, two_fa_grace_until')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!adminData || !adminData.requires_2fa) {
        setRequiresSetup(false);
        setLoading(false);
        return;
      }

      const { data: twoFAData } = await supabase
        .from('two_factor_auth')
        .select('enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      const has2FA = twoFAData?.enabled === true;
      const gracePeriod = adminData.two_fa_grace_until ? new Date(adminData.two_fa_grace_until) : null;
      const inGracePeriod = gracePeriod && gracePeriod > new Date();

      setRequiresSetup(!has2FA);
      setGraceUntil(inGracePeriod ? gracePeriod : null);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!requiresSetup) {
    return null;
  }

  const daysRemaining = graceUntil
    ? Math.ceil((graceUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const isUrgent = daysRemaining <= 7;
  const isBlocking = !graceUntil || daysRemaining <= 0;

  if (isBlocking) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full glass-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-red-500/20 p-4 rounded-full">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Two-Factor Authentication Required</h2>
              <p className="text-red-400">Admin accounts must have 2FA enabled to access the platform</p>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold mb-2">Access Restricted</p>
                <p className="text-slate-300 text-sm">
                  Your grace period has expired. You must enable two-factor authentication to continue using admin features.
                  This is a security requirement for all administrator accounts.
                </p>
              </div>
            </div>
          </div>

          <TwoFactorAuth />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isUrgent ? 'bg-red-500/10 border-red-500' : 'bg-yellow-500/10 border-yellow-500'} border rounded-xl p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <div className={`${isUrgent ? 'bg-red-500/20' : 'bg-yellow-500/20'} p-2 rounded-lg flex-shrink-0`}>
          <Clock className={`w-5 h-5 ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`} />
        </div>
        <div className="flex-1">
          <h3 className={`${isUrgent ? 'text-red-400' : 'text-yellow-400'} font-semibold mb-1`}>
            Two-Factor Authentication Required
          </h3>
          <p className="text-slate-300 text-sm mb-3">
            As an administrator, you are required to enable 2FA for enhanced security.
            You have <strong>{daysRemaining} days</strong> remaining to set this up.
          </p>
          <button
            onClick={() => window.location.href = '#/profile'}
            className={`px-4 py-2 ${isUrgent ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-black font-semibold rounded-lg transition`}
          >
            Enable 2FA Now
          </button>
        </div>
      </div>
    </div>
  );
}
