import { useRef, forwardRef, useImperativeHandle } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface CaptchaProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export interface CaptchaRef {
  reset: () => void;
  execute: () => void;
}

const Captcha = forwardRef<CaptchaRef, CaptchaProps>(({ onVerify, onError, onExpire }, ref) => {
  const captchaRef = useRef<HCaptcha>(null);
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

  useImperativeHandle(ref, () => ({
    reset: () => {
      captchaRef.current?.resetCaptcha();
    },
    execute: () => {
      captchaRef.current?.execute();
    },
  }));

  if (!siteKey) {
    console.warn('hCaptcha site key not configured');
    return null;
  }

  return (
    <div className="flex justify-center">
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={onVerify}
        onError={onError}
        onExpire={onExpire}
        theme="dark"
      />
    </div>
  );
});

Captcha.displayName = 'Captcha';

export default Captcha;
