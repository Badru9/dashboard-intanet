import { type LoginForm } from '@/types/index.d';
import { Checkbox, Input } from '@heroui/react';
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
        <div className="flex min-h-screen items-center justify-center bg-background text-gray-900">
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
                        <div className="space-y-5 text-slate-900">
                            <Input
                                type="email"
                                label="Email"
                                variant="bordered"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                errorMessage={errors.email}
                                disabled={processing}
                                radius="md"
                                isRequired
                            />
                            <Input
                                type="password"
                                label="Password"
                                variant="bordered"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                errorMessage={errors.password}
                                disabled={processing}
                                radius="md"
                                isRequired
                            />
                        </div>

                        <div className="flex items-center justify-between text-slate-900">
                            <Checkbox
                                checked={data.remember}
                                color="primary"
                                onChange={(e) => setData('remember', e.target.checked)}
                                disabled={processing}
                            >
                                <span className="text-slate-900">Remember Me</span>
                            </Checkbox>
                            <a href={route('password.request')} className="hover:text-primary-dark text-sm text-primary">
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="focus:ring-tertiary hover:bg-primary-dark w-full cursor-pointer rounded-xl bg-primary py-3.5 text-white transition duration-200 hover:bg-primary/70 focus:ring-2 focus:ring-offset-2"
                            disabled={processing}
                        >
                            {processing ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <a href={route('register')} className="hover:text-primary-dark font-medium text-primary">
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
