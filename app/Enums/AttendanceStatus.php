<?php

namespace App\Enums;

use App\Traits\EnumToArray; // Jika Anda ingin menambahkan trait untuk konversi ke array

enum AttendanceStatus: string
{
    // use EnumToArray; // Contoh penggunaan trait

    case PRESENT = 'PRESENT';
    case ABSENT = 'ABSENT';
    case LATE = 'LATE';
    case SICK = 'SICK';
    case LEAVE = 'LEAVE';
    case HALF_DAY = 'HALF_DAY';

    // Anda bisa menambahkan method lain di sini, contoh:
    public function label(): string
    {
        return match ($this) {
            self::PRESENT => 'Present',
            self::ABSENT => 'Absent',
            self::LATE => 'Late',
            self::SICK => 'Sick',
            self::LEAVE => 'On Leave',
            self::HALF_DAY => 'Half Day',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PRESENT => 'success',
            self::ABSENT => 'danger',
            self::LATE => 'warning',
            self::SICK => 'info',
            self::LEAVE => 'primary',
            self::HALF_DAY => 'secondary',
        };
    }
}
