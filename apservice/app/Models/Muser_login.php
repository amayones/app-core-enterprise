<?php
// File: apservice/app/Models/Muser_login.php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class Muser_login
{
    private const TABLE = 'm_user';

    private function table()
    {
        return DB::connection('sqlsrv')->table(self::TABLE);
    }

    /**
     * -> POST /user_login/user_logins
     * List untuk grid, sudah di-join dengan nama Dept & Role.
     */
    public function read_data($payload = [])
    {
        return DB::connection('sqlsrv')->table(self::TABLE . ' AS U')
            ->leftJoin('m_dept AS D', 'D.DEPT_ID', '=', 'U.DEPT_ID')
            ->leftJoin('m_role AS R', 'R.ROLE_ID', '=', 'U.ROLE_ID')
            ->select(
                'U.USER_ID', 'U.USERNAME', 'U.FULLNAME', 'U.EMAIL',
                'U.DEPT_ID', 'D.DEPT_NAME',
                'U.ROLE_ID', 'R.ROLE_NAME',
                'U.IS_ACTIVE', 'U.LAST_LOGIN'
            )
            ->orderBy('U.FULLNAME')
            ->get();
    }

    /**
     * -> POST /user_login/user_login
     * method dibaca dari payload['method']: insert, update, delete,
     * plus 2 method tambahan untuk isi dropdown form: dept_list, role_list.
     */
    public function handleAction($method, $payload)
    {
        switch ($method) {
            case 'insert':
            case 'update':
                return $this->save($payload);

            case 'delete':
                return $this->delete($payload);

            case 'dept_list':
                return DB::connection('sqlsrv')->table('m_dept')
                    ->select('DEPT_ID', 'DEPT_NAME')
                    ->orderBy('DEPT_NAME')
                    ->get();

            case 'role_list':
                return DB::connection('sqlsrv')->table('m_role')
                    ->select('ROLE_ID', 'ROLE_NAME')
                    ->orderBy('ROLE_NAME')
                    ->get();

            default:
                throw new \Exception("Method '{$method}' tidak dikenali.");
        }
    }

    private function validateUser(array $nvdata, bool $isUpdate): array
    {
        $rules = [
            'USER_ID'   => 'nullable|integer',
            'USERNAME'  => 'required|string|max:50',
            'FULLNAME'  => 'required|string|max:150',
            'EMAIL'     => 'nullable|email|max:100',
            'DEPT_ID'   => 'nullable|integer',
            'ROLE_ID'   => 'required|integer',
            'IS_ACTIVE' => 'nullable|boolean',
            // Password wajib diisi saat tambah user baru, opsional saat edit
            // (kosong = password lama tidak diubah).
            'PASSWORD'  => ($isUpdate ? 'nullable' : 'required') . '|string|min:3',
        ];

        $validator = validator($nvdata, $rules);

        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }

        $clean = $validator->validated();

        // Pastikan USERNAME unik (kecuali terhadap dirinya sendiri saat update)
        $duplicate = $this->table()
            ->where('USERNAME', $clean['USERNAME'])
            ->when(!empty($clean['USER_ID']), function ($q) use ($clean) {
                $q->where('USER_ID', '<>', $clean['USER_ID']);
            })
            ->exists();

        if ($duplicate) {
            throw new \Exception('Username sudah digunakan.');
        }

        $data = [
            'USERNAME'  => $clean['USERNAME'],
            'FULLNAME'  => $clean['FULLNAME'],
            'EMAIL'     => $clean['EMAIL'] ?? null,
            'DEPT_ID'   => $clean['DEPT_ID'] ?? null,
            'ROLE_ID'   => $clean['ROLE_ID'],
            'IS_ACTIVE' => isset($clean['IS_ACTIVE']) ? (int) $clean['IS_ACTIVE'] : 1,
        ];

        // Hanya set PASSWORD_HASH kalau field password diisi.
        if (!empty($clean['PASSWORD'])) {
            $data['PASSWORD_HASH'] = Hash::make($clean['PASSWORD']);
        }

        return $data;
    }

    private function save($payload)
    {
        $nvdata = $payload['nvdata'] ?? [];
        $userId = $nvdata['USER_ID'] ?? null;
        $data   = $this->validateUser($nvdata, (bool) $userId);

        if ($userId) {
            $this->table()->where('USER_ID', $userId)->update($data);
        } else {
            $data['CREATED_AT'] = now();
            $userId = $this->table()->insertGetId($data, 'USER_ID');
        }

        $record = $this->table()
            ->where('USER_ID', $userId)
            ->select('USER_ID', 'USERNAME', 'FULLNAME', 'EMAIL', 'DEPT_ID', 'ROLE_ID', 'IS_ACTIVE')
            ->first();

        return [
            'message' => 'Data user berhasil disimpan.',
            'record'  => $record,
        ];
    }

    private function delete($payload)
    {
        $nvdata = $payload['nvdata'] ?? [];

        if (empty($nvdata['USER_ID'])) {
            throw new \Exception('USER_ID wajib diisi untuk hapus data.');
        }

        $deleted = $this->table()->where('USER_ID', $nvdata['USER_ID'])->delete();

        if (!$deleted) {
            throw new \Exception('Data user tidak ditemukan.');
        }

        return [
            'message' => 'Data user berhasil dihapus.',
        ];
    }
}