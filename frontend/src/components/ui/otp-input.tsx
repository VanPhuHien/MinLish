import {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type OtpInputRef = {
  clearWithAnimation: () => Promise<void>;
};

type OtpInputProps = {
  length?: number;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
};

const OtpInput = forwardRef<OtpInputRef, OtpInputProps>(
  ({ length = 6, value, onChange, error }, ref) => {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const [clearingIndex, setClearingIndex] = useState(-1);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useImperativeHandle(ref, () => ({
      clearWithAnimation: async () => {
        // Clear one by one from right to left with a sequential fade-out effect
        for (let i = length - 1; i >= 0; i--) {
          setClearingIndex(i);
          await new Promise((resolve) => setTimeout(resolve, 100)); // Delay to see the number "fading"
          setOtp((prev) => {
            const next = [...prev];
            next[i] = "";
            return next;
          });
          setClearingIndex(-1);
        }
        onChange("");
        inputRefs.current[0]?.focus();
      },
    }));

    // Sync internal state with external value
    useEffect(() => {
      // Không cập nhật từ bên ngoài nếu đang trong quá trình chạy hiệu ứng xóa
      if (clearingIndex !== -1) return;

      if (value === "") {
        setOtp(new Array(length).fill(""));
      } else if (value && value.length === length) {
        setOtp(value.split(""));
      }
    }, [value, length, clearingIndex]);

    const handleChange = (element: HTMLInputElement, index: number) => {
      const val = element.value;
      if (Number.isNaN(Number(val))) return false;

      const newOtp = [...otp];
      newOtp[index] = val.substring(val.length - 1);
      setOtp(newOtp);
      onChange(newOtp.join(""));

      if (val && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (
      e: KeyboardEvent<HTMLInputElement>,
      index: number,
    ) => {
      if (e.key === "Backspace") {
        if (!otp[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      }
    };

    const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const data = e.clipboardData.getData("text").slice(0, length);
      if (!/^\d+$/.test(data)) return;

      const newOtp = data.split("");
      const paddedOtp = [
        ...newOtp,
        ...new Array(length - newOtp.length).fill(""),
      ];
      setOtp(paddedOtp);
      onChange(paddedOtp.join(""));

      const nextIndex = Math.min(data.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    };

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={data}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange(e.target, index)
              }
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all outline-none",
                "focus:border-primary focus:ring-2 focus:ring-primary/20",
                error
                  ? "border-destructive ring-destructive/20"
                  : "border-border bg-background",
                "shadow-sm bg-white",
                clearingIndex === index && "animate-fade-out",
              )}
              inputMode="numeric"
            />
          ))}
        </div>
        <style jsx global>{`
          @keyframes fade-out {
            0% {
              opacity: 1;
              transform: scale(1);
            }
            100% {
              opacity: 0;
              transform: scale(0.8);
            }
          }
          .animate-fade-out {
            animation: fade-out 0.15s ease-out forwards;
          }
        `}</style>
        {error && (
          <p className="text-xs text-destructive text-center mt-1 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  },
);

OtpInput.displayName = "OtpInput";
export default OtpInput;
