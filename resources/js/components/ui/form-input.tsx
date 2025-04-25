import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, containerClassName, className, ...props }, ref) => {
        return (
            <div className={cn('space-y-2', containerClassName)}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'focus:border-primary focus:ring-tertiary w-full rounded-xl border border-gray-200 px-4 py-3.5 focus:ring-2 focus:outline-none',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';

export { FormInput }; 