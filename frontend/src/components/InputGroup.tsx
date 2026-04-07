import React from 'react';

interface InputGroupProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}

export function InputGroup({ label, value, onChange, placeholder, type = "text", icon }: InputGroupProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-tg-hint font-black uppercase tracking-widest px-1 opacity-40">{label}</label>
      <div className="relative group">
         {icon && (
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors">
              {icon}
           </div>
         )}
         <input 
            type={type} 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full glass-card bg-white/5 border-white/10 ${icon ? 'pl-11' : 'pl-5'} p-4 text-sm focus:ring-2 ring-primary/20 outline-none transition-all placeholder:text-white/10 font-medium`}
            placeholder={placeholder}
            required
         />
      </div>
    </div>
  )
}
