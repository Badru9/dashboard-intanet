import { FormInput } from '@/components/ui/form-input';
import { type RegisterForm } from '@/types/index.d';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm<RegisterForm>({
        name: '',
        email: '',
        username: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: '',
        terms: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-5 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <div className="container mx-auto flex max-w-6xl items-center justify-between px-6">
                {/* Form Section */}
                <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                    {/* Logo */}
                    <div className="mb-6">
                        <img src="/images/logo/intanet-text.png" alt="Logo" className="h-8 object-contain" />
                    </div>

                    <div className="mb-8">
                        <h1 className="mb-2 text-4xl font-bold">Buat Akun</h1>
                        {/* <p className="text-gray-600 dark:text-gray-100">Enter your details below to create your account</p> */}
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-5">
                            <FormInput
                                type="text"
                                label="Nama Lengkap"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="John Doe"
                                error={errors.name}
                                disabled={processing}
                            />
                            <FormInput
                                type="email"
                                label="Email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@example.com"
                                error={errors.email}
                                disabled={processing}
                            />
                            <FormInput
                                type="text"
                                label="Username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="johndoe"
                                error={errors.username}
                                disabled={processing}
                            />
                            <FormInput
                                type="password"
                                label="Kata Sandi"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••••••"
                                error={errors.password}
                                disabled={processing}
                            />
                            <FormInput
                                type="password"
                                label="Konfirmasi Kata Sandi"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="••••••••••••"
                                error={errors.password_confirmation}
                                disabled={processing}
                            />
                            <FormInput
                                type="text"
                                label="Nomor Telepon"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="081234567890"
                                error={errors.phone}
                                disabled={processing}
                            />
                            <FormInput
                                type="text"
                                label="Alamat"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Jl. Example No. 123"
                                error={errors.address}
                                disabled={processing}
                            />
                        </div>

                        <button
                            type="submit"
                            className="focus:ring-tertiary hover:bg-primary-dark w-full cursor-pointer rounded-xl bg-primary py-3.5 text-white transition duration-200 hover:bg-primary/70 focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={processing}
                        >
                            {processing ? 'Membuat akun...' : 'Buat akun'}
                        </button>

                        <div className="text-center text-sm text-gray-600 dark:text-gray-100">
                            Sudah punya akun?{' '}
                            <a href={route('login')} className="hover:text-primary-dark font-medium text-primary">
                                Masuk
                            </a>
                        </div>
                    </form>
                </div>

                {/* Illustration Section */}
                <div className="hidden lg:block lg:w-1/2 lg:pl-12">
                    <div className="relative h-[600px] w-[600px] overflow-hidden rounded-3xl">
                        <img src="/images/illustrations/login.png" alt="Register illustration" className="h-full w-full object-cover" />
                    </div>
                </div>
            </div>
        </div>
    );
}
