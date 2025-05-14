<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\InternetPackage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Faker\Factory as Faker;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $packages = InternetPackage::all();
        $statuses = ['online', 'inactive', 'offline'];
        $companyTypes = ['PT', 'CV', 'UD'];
        $cities = [
            'Jakarta',
            'Bandung',
            'Surabaya',
            'Medan',
            'Semarang',
            'Makassar',
            'Palembang',
            'Denpasar',
            'Yogyakarta',
            'Malang'
        ];

        $areaCodes = [
            'Jakarta' => '021',
            'Bandung' => '022',
            'Surabaya' => '031',
            'Medan' => '061',
            'Semarang' => '024',
            'Makassar' => '0411',
            'Palembang' => '0711',
            'Denpasar' => '0361',
            'Yogyakarta' => '0274',
            'Malang' => '0341'
        ];

        $coordinates = [
            'Jakarta' => '-6.2088,106.8456',
            'Bandung' => '-6.9147,107.6098',
            'Surabaya' => '-7.2575,112.7521',
            'Medan' => '3.5952,98.6722',
            'Semarang' => '-6.9667,110.4167',
            'Makassar' => '-5.1477,119.4327',
            'Palembang' => '-2.9909,104.7566',
            'Denpasar' => '-8.6705,115.2126',
            'Yogyakarta' => '-7.7972,110.3688',
            'Malang' => '-7.9666,112.6326'
        ];

        $streets = [
            'Sudirman',
            'Thamrin',
            'Asia Afrika',
            'Diponegoro',
            'Tunjungan',
            'Gatot Subroto',
            'Pemuda',
            'Urip Sumoharjo',
            'Jend. Sudirman',
            'Raya Kuta',
            'Malioboro',
            'Merdeka',
            'Sisingamangaraja',
            'Raya Darmo'
        ];

        // Format NPWP yang valid
        $npwpPrefixes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'];

        for ($i = 1; $i <= 20; $i++) {
            $city = $faker->randomElement($cities);
            $companyType = $faker->randomElement($companyTypes);
            $companyName = $faker->company;
            $street = $faker->randomElement($streets);
            $addressNumber = $faker->numberBetween(1, 200);

            // Generate NPWP dengan format yang valid
            $npwp = $faker->optional(0.7)->randomElement($npwpPrefixes) . '.' .
                $faker->numerify('###') . '.' .
                $faker->numerify('###') . '.' .
                $faker->numerify('#') . '-' .
                $faker->numerify('###') . '.' .
                $faker->numerify('###');

            Customer::create([
                'name' => $companyType . '. ' . $companyName,
                'customer_id' => $faker->unique()->numerify('IDPEL-####'),
                'email' => $faker->unique()->companyEmail,
                'phone' => $areaCodes[$city] . '-' . $faker->numerify('########'),
                'address' => 'Jl. ' . $street . ' No. ' . $addressNumber . ', ' . $city,
                'status' => $faker->randomElement($statuses),
                'package_id' => $packages->random()->id,
                'npwp' => $npwp,
                'tax_invoice_number' => $faker->optional(0.5)->numerify('INV-####-####'),
                'coordinate' => $coordinates[$city],
                'join_date' => $faker->dateTimeBetween('-1 year', 'now'),
                'bill_date' => $faker->numberBetween(1, 28),
                'inactive_at' => $faker->optional(0.3)->dateTimeBetween('-1 year', 'now'),
            ]);
        }
    }
}
