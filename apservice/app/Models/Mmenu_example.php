<?php
// File: apservice/app/Models/Mmenu_example.php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class Mmenu_example
{
    /**
     * Nama tabel database.
     */
    private const TABLE = 'm_menu_example';

    /**
     * Query Builder menggunakan koneksi SQL Server.
     */
    private function table()
    {
        return DB::connection('sqlsrv')->table(self::TABLE);
    }

    /**
     * Ambil data untuk grid.
     */
    public function read_data($payload = [])
    {
        return $this->table()
            ->select(
                'id',
                'contoh1',
                'contoh2',
                'contoh3',
                'contoh4',
                'contoh5'
            )
            ->orderBy('id', 'desc')
            ->get();
    }

    /**
     * Handle insert, update, dan delete.
     */
    public function handleAction($method, $payload)
    {
        switch ($method) {
            case 'insert':
            case 'update':
                return $this->save($payload);

            case 'delete':
                return $this->delete($payload);

            default:
                throw new \Exception(
                    "Method '{$method}' tidak dikenali."
                );
        }
    }

    /**
     * Validasi data.
     */
    private function validateData(array $nvdata): array
    {
        $validator = validator($nvdata, [
            'id'      => 'nullable|integer',
            'contoh1' => 'required|string|max:100',
            'contoh2' => 'required|integer',
            'contoh3' => 'nullable|string',
            'contoh4' => 'nullable|numeric',
            'contoh5' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            throw new \Exception(
                $validator->errors()->first()
            );
        }

        $clean = $validator->validated();

        return [
            'contoh1' => $clean['contoh1'],
            'contoh2' => $clean['contoh2'],
            'contoh3' => $clean['contoh3'] ?? null,
            'contoh4' => $clean['contoh4'] ?? null,
            'contoh5' => isset($clean['contoh5'])
                ? (int) $clean['contoh5']
                : 0,
        ];
    }

    /**
     * Insert atau update data.
     */
    private function save($payload)
    {
        $nvdata = $payload['nvdata'] ?? [];

        $data = $this->validateData($nvdata);

        $id = $nvdata['id'] ?? null;

        if ($id) {

            $updated = $this->table()
                ->where('id', $id)
                ->update($data);

            if (!$updated) {
                throw new \Exception(
                    'Data tidak ditemukan atau tidak ada perubahan.'
                );
            }

        } else {

            $id = $this->table()
                ->insertGetId($data, 'id');
        }

        $record = $this->table()
            ->where('id', $id)
            ->first();

        return [
            'message' => 'Data berhasil disimpan.',
            'record'  => $record,
        ];
    }

    /**
     * Hapus data.
     */
    private function delete($payload)
    {
        $nvdata = $payload['nvdata'] ?? [];

        if (empty($nvdata['id'])) {
            throw new \Exception(
                'ID wajib diisi untuk menghapus data.'
            );
        }

        $deleted = $this->table()
            ->where('id', $nvdata['id'])
            ->delete();

        if (!$deleted) {
            throw new \Exception(
                'Data tidak ditemukan.'
            );
        }

        return [
            'message' => 'Data berhasil dihapus.',
        ];
    }
}