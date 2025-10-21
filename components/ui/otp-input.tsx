'use client'

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  className?: string;
}

export function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  onComplete,
  className 
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Update internal state when external value changes
    const otpArray = value.split('').slice(0, length);
    const paddedArray = [...otpArray, ...Array(length - otpArray.length).fill('')];
    setOtp(paddedArray);
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    // Only allow digits
    if (!/^\d*$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1); // Take only the last digit
    setOtp(newOtp);

    const otpValue = newOtp.join('');
    onChange(otpValue);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits are filled
    if (otpValue.length === length && onComplete) {
      onComplete(otpValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, length);
        const newOtp = digits.split('').concat(Array(length - digits.length).fill(''));
        setOtp(newOtp);
        onChange(digits);
        
        // Focus the next empty input or the last input
        const nextIndex = Math.min(digits.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
        
        if (digits.length === length && onComplete) {
          onComplete(digits);
        }
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);
    
    const newOtp = [...Array(length)].map((_, i) => digits[i] || '');
    setOtp(newOtp);
    onChange(digits);
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(digits.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    
    if (digits.length === length && onComplete) {
      onComplete(digits);
    }
  };

  return (
    <div className={cn("flex gap-3 justify-center", className)}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "w-12 h-12 text-center text-xl font-semibold",
            "border-2 rounded-xl",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "transition-all duration-200",
            digit ? "border-primary bg-primary/5" : "border-muted-foreground/30",
            "hover:border-primary/50"
          )}
          data-testid={`otp-input-${index}`}
        />
      ))}
    </div>
  );
}
