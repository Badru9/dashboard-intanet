import { FormInput } from '@/components/ui/form-input';
import { type LoginForm } from '@/types/index.d';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="bg-background flex min-h-screen items-center justify-center text-gray-900">
            <div className="container mx-auto flex max-w-6xl items-center justify-between px-6">
                {/* Form Section */}
                <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
                    {/* Logo */}
                    <div className="mb-6">
                        <img src="/images/logo/intanet-text.png" alt="Logo" className="h-8 object-contain" />
                    </div>

                    <div className="mb-8">
                        <h1 className="mb-2 text-4xl font-bold">Hello,</h1>
                        <h2 className="mb-4 text-4xl font-bold">Welcome Back</h2>
                        <p className="text-gray-600">Hey, welcome back to your special place</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-5">
                            <FormInput
                                type="email"
                                label="Email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="stanley@gmail.com"
                                error={errors.email}
                                disabled={processing}
                            />
                            <FormInput
                                type="password"
                                label="Password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••••••"
                                error={errors.password}
                                disabled={processing}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                                    disabled={processing}
                                />
                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                            </label>
                            <a href={route('password.request')} className="text-primary hover:text-primary-dark text-sm">
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary/70 focus:ring-tertiary hover:bg-primary-dark w-full cursor-pointer rounded-xl py-3.5 text-white transition duration-200 focus:ring-2 focus:ring-offset-2"
                            disabled={processing}
                        >
                            {processing ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <a href={route('register')} className="text-primary hover:text-primary-dark font-medium">
                                Sign Up
                            </a>
                        </div>
                    </form>
                </div>

                {/* Illustration Section */}
                <div className="hidden lg:block lg:w-1/2 lg:pl-12">
                    <div className="relative h-[600px] w-[600px] overflow-hidden rounded-3xl">
                        <img src="/images/illustrations/login.png" alt="Login illustration" className="h-full w-full object-cover" />
                    </div>
                </div>
            </div>
        </div>
    );
}
