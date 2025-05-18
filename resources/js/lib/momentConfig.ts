import moment from 'moment';
import 'moment/locale/id';

export const setupMomentLocale = () => {
    moment.locale('id');

    // Optional: Kustomisasi format sesuai kebutuhan Indonesia
    moment.updateLocale('id', {
        months: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
        weekdays: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
        // Format khusus yang sering digunakan
        formats: {
            LT: 'HH.mm',
            LTS: 'HH.mm.ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH.mm',
            LLLL: 'dddd, D MMMM YYYY HH.mm',
        },
    });

    return moment;
};

// Pendekatan 3: Verifikasi locale sebelum digunakan
export const validateAndSetLocale = (localeCode = 'id') => {
    // Pastikan locale yang diminta tersedia
    if (!moment.locales().includes(localeCode)) {
        console.warn(`Locale "${localeCode}" tidak tersedia dalam MomentJS. Menggunakan default locale.`);
        return false;
    }

    moment.locale(localeCode);
    // Verifikasi locale berhasil diaplikasikan
    if (moment.locale() !== localeCode) {
        console.warn(`Gagal mengatur locale ke "${localeCode}". Menggunakan: ${moment.locale()}`);
        return false;
    }

    return true;
};
