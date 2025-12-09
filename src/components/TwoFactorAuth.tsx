import { useState, useEffect } from 'react';
import { Shield, Key, Copy, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function TwoFactorAuth() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTwoFactorStatus();
    }
  }, [user]);

  const fetchTwoFactorStatus = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('two_factor_auth')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setEnabled(data.enabled);
        if (data.backup_codes) {
          setBackupCodes(data.backup_codes);
        }
      }
    } catch (err) {
      console.error('Error fetching 2FA status:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSecret = async () => {
    if (!user) return;

    try {
      const newSecret = generateRandomSecret();
      setSecret(newSecret);

      const qrCodeUrl = `otpauth://totp/BlackCatsBook:${user.email}?secret=${newSecret}&issuer=BlackCatsBook`;
      setQrCode(qrCodeUrl);
    } catch (err) {
      setError('Failed to generate 2FA secret');
    }
  };

  const generateRandomSecret = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const generateBackupCodes = (): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const enableTwoFactor = async () => {
    if (!user || !verificationCode || !secret) {
      setError('Please enter verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newBackupCodes = generateBackupCodes();

      const { error: upsertError } = await supabase
        .from('two_factor_auth')
        .upsert({
          user_id: user.id,
          enabled: true,
          secret: secret,
          backup_codes: newBackupCodes,
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      setEnabled(true);
      setBackupCodes(newBackupCodes);
      setSuccess('Two-factor authentication enabled successfully!');
      setVerificationCode('');
    } catch (err) {
      setError('Failed to enable 2FA. Please check your code and try again.');
      console.error('Error enabling 2FA:', err);
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!user) return;

    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('two_factor_auth')
        .update({ enabled: false, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;

      setEnabled(false);
      setSecret('');
      setQrCode('');
      setSuccess('Two-factor authentication disabled');
    } catch (err) {
      setError('Failed to disable 2FA');
      console.error('Error disabling 2FA:', err);
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadBackupCodes = () => {
    const text = `Valeris - 2FA Backup Codes\n\nSave these codes in a secure location.\nEach code can only be used once.\n\n${backupCodes.join('\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Two-Factor Authentication</h2>
          <p className="text-slate-400 text-sm">Add an extra layer of security to your account</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {!enabled ? (
        <div className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              Two-factor authentication adds an extra layer of security by requiring a verification code from your phone
              in addition to your password when signing in.
            </p>
          </div>

          {!secret ? (
            <button
              onClick={generateSecret}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Enable Two-Factor Authentication
            </button>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Step 1: Scan QR Code</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <div className="w-48 h-48 bg-slate-200 flex items-center justify-center">
                    <p className="text-slate-500 text-center text-sm">QR Code Placeholder<br/>(Implement with library)</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Or enter this code manually:</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={secret}
                    readOnly
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                  />
                  <button
                    onClick={copySecret}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Step 2: Verify Code</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Enter the 6-digit code from your authenticator app
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              <button
                onClick={enableTwoFactor}
                disabled={verificationCode.length !== 6}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Verify and Enable 2FA
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-400 font-semibold">Two-Factor Authentication is Enabled</p>
              <p className="text-green-400/80 text-sm">Your account is protected with 2FA</p>
            </div>
          </div>

          {backupCodes.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Backup Codes</h3>
                <button
                  onClick={downloadBackupCodes}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  Download Codes
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-3">
                Save these codes in a secure location. Each can only be used once if you lose access to your
                authenticator app.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="bg-slate-800 rounded px-3 py-2 font-mono text-sm text-white">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={disableTwoFactor}
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-3 rounded-lg transition-colors"
          >
            Disable Two-Factor Authentication
          </button>
        </div>
      )}
    </div>
  );
}
