<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use PDO;

/**
 * BaseModel
 *
 * Induk dari semua model M<Control> (mis. Msupplier_list).
 * Tidak pakai Eloquent karena data master ada di stored procedure,
 * bukan tabel yang di-manage lewat migration.
 *
 * Setiap M<Control> WAJIB override minimal salah satu dari:
 *   - read_data()          -> dipanggil saat endpoint .../<control>s
 *   - handleAction($m,$p)  -> dipanggil saat endpoint .../<control> dengan payload['method']
 * atau menyediakan method publik lain yang dipanggil langsung oleh HomeController.
 */
abstract class BaseModel
{
    /**
     * Nama koneksi database yang dipakai. Override di child class
     * kalau modul tertentu perlu koneksi berbeda.
     */
    protected string $connection = 'sqlsrv';

    /**
     * Dipanggil saat frontend request ke endpoint bentuk jamak,
     * contoh: /home/supplier_list/supplier_lists
     * Biasanya untuk listing grid.
     */
    public function read_data(array $payload = []): array
    {
        throw new \RuntimeException(static::class . ' belum implementasi read_data()');
    }

    /**
     * Dipanggil saat frontend request ke endpoint bentuk tunggal
     * dengan payload['method'] diisi, contoh:
     * /home/supplier_list/supplier_list  { method: "insert", nvdata: {...} }
     */
    public function handleAction(string $method, array $payload = []): array
    {
        if (empty($method) || $method === 'read') {
            return $this->read_data($payload);
        }

        if (method_exists($this, $method)) {
            return $this->{$method}($payload);
        }

        throw new \RuntimeException("Method '{$method}' tidak ditemukan di " . static::class);
    }

    /**
     * Helper inti: eksekusi stored procedure yang mengembalikan
     * SATU result-set. Cocok untuk sebagian besar SP CRUD biasa.
     *
     * @param string $spName   nama stored procedure, mis. "SP_SUPPLIER_LIST_LIST"
     * @param array  $params   asosiatif ['@PARAM_NAME' => value, ...] ATAU list biasa
     */
    protected function callProcedure(string $spName, array $params = []): array
    {
        $placeholders = implode(',', array_fill(0, count($params), '?'));
        $sql = "EXEC {$spName} {$placeholders}";

        $results = DB::connection($this->connection)->select($sql, array_values($params));

        return json_decode(json_encode($results), true);
    }

    /**
     * Helper untuk stored procedure yang mengembalikan BEBERAPA
     * result-set sekaligus (mis. SP_USERLOGIN_RELOAD).
     * Return: array of result-sets, urut sesuai urutan SELECT di SP.
     *
     * @return array<int, array>
     */
    protected function callProcedureMultiResultSet(string $spName, array $params = []): array
    {
        $pdo = DB::connection($this->connection)->getPdo();

        $placeholders = implode(',', array_fill(0, count($params), '?'));
        $stmt = $pdo->prepare("EXEC {$spName} {$placeholders}");
        $stmt->execute(array_values($params));

        $resultSets = [];
        do {
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $resultSets[] = $rows;
        } while ($stmt->nextRowset());

        return $resultSets;
    }
}
