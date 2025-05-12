<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */


    public function run(): void
    {
        $settings = [
            [
                'key' => 'ppn',
                'label' => 'PPN',
                'value' => '11',
            ],
            [
                'key' => 'bph',
                'label' => 'BPH',
                'value' => '0.5',
            ],
            [
                'key' => 'uso',
                'label' => 'Uso',
                'value' => '1.25',
            ],
            [
                'key' => 'pph',
                'label' => 'PPH',
                'value' => '2',
            ],
            [
                'key' => 'admin',
                'label' => 'ADMIN',
                'value' => '2.75',
            ],
            [
                'key' => 'prtg',
                'label' => 'PRTG',
                'value' => '3.50',
            ],
            [
                'key' => 'noc_24_jam',
                'label' => 'NOC 24 Jam',
                'value' => '5',
            ],
        ];
        //
        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}
