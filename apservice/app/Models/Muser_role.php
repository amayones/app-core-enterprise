<?php
// File: apservice/app/Models/Muser_role.php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class Muser_role
{
    /**
     * -> POST /user_role/user_roles
     * List Role untuk panel kiri.
     */
    public function read_data($payload = [])
    {
        return DB::connection('sqlsrv')->table('m_role')
            ->select('ROLE_ID', 'ROLE_CODE', 'ROLE_NAME', 'IS_ACTIVE')
            ->orderBy('ROLE_NAME')
            ->get();
    }

    /**
     * -> POST /user_role/user_role
     */
    public function handleAction($method, $payload)
    {
        switch ($method) {
            case 'insert':
                return $this->createRole($payload);

            case 'delete':
                return $this->deleteRole($payload);

            case 'menu_tree':
                return $this->menuTree($payload);

            case 'toggle_access':
                return $this->toggleAccess($payload);

            default:
                throw new \Exception("Method '{$method}' tidak dikenali.");
        }
    }

    private function createRole($payload)
    {
        $nvdata = $payload['nvdata'] ?? [];

        $validator = validator($nvdata, [
            'ROLE_NAME' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }

        $roleName = trim($nvdata['ROLE_NAME']);

        // Generate ROLE_CODE dari nama: "Finance Staff" -> "GROUP_FINANCE_STAFF"
        $slug = strtoupper(preg_replace('/[^A-Za-z0-9]+/', '_', $roleName));
        $roleCode = 'GROUP_' . trim($slug, '_');

        $exists = DB::connection('sqlsrv')->table('m_role')
            ->where('ROLE_CODE', $roleCode)
            ->exists();

        if ($exists) {
            throw new \Exception('Role dengan nama tersebut sudah ada.');
        }

        $roleId = DB::connection('sqlsrv')->table('m_role')->insertGetId([
            'ROLE_CODE'  => $roleCode,
            'ROLE_NAME'  => $roleName,
            'IS_ACTIVE'  => 1,
            'CREATED_AT' => now(),
        ], 'ROLE_ID');

        return [
            'message' => 'Role berhasil dibuat.',
            'record'  => ['ROLE_ID' => $roleId, 'ROLE_CODE' => $roleCode, 'ROLE_NAME' => $roleName],
        ];
    }

    private function deleteRole($payload)
    {
        $nvdata = $payload['nvdata'] ?? [];

        if (empty($nvdata['ROLE_ID'])) {
            throw new \Exception('ROLE_ID wajib diisi untuk hapus data.');
        }

        DB::connection('sqlsrv')->transaction(function () use ($nvdata) {
            $role = DB::connection('sqlsrv')->table('m_role')
                ->where('ROLE_ID', $nvdata['ROLE_ID'])
                ->first();

            if (!$role) {
                throw new \Exception('Role tidak ditemukan.');
            }

            // Bersihkan akses menu yang terkait role ini dulu, baru hapus role-nya.
            DB::connection('sqlsrv')->table('menu_role_access')
                ->where('ROLE_CODE', $role->ROLE_CODE)
                ->delete();

            DB::connection('sqlsrv')->table('m_role')
                ->where('ROLE_ID', $nvdata['ROLE_ID'])
                ->delete();
        });

        return ['message' => 'Role berhasil dihapus.'];
    }

    /**
     * Bangun tree menu (modul -> menu -> sub-menu) lengkap dengan status
     * checked sesuai akses role yang dipilih.
     */
    private function menuTree($payload)
    {
        $nvdata   = $payload['nvdata'] ?? [];
        $roleCode = $nvdata['ROLE_CODE'] ?? null;

        if (empty($roleCode)) {
            throw new \Exception('ROLE_CODE wajib diisi.');
        }

        // Ambil urutan modul (dipakai untuk sorting saja, bukan bikin node baru)
        $moduleOrder = DB::connection('sqlsrv')->table('menu_module')
            ->where('IS_ACTIVE', 1)
            ->orderBy('MODULE_ORDER')
            ->pluck('MODULE_ORDER', 'MMODULE');

        $menus = DB::connection('sqlsrv')->table('menu_master')
            ->where('IS_ACTIVE', 1)
            ->orderBy('MSHORT')
            ->get();

        $accessSet = DB::connection('sqlsrv')->table('menu_role_access')
            ->where('ROLE_CODE', $roleCode)
            ->pluck('MCODE')
            ->flip();

        // Rekursif bangun children berdasarkan MPARRENT = MCODE induk (di dalam modul yang sama).
        $buildChildren = function ($parentCode, $moduleCode) use ($menus, $accessSet, &$buildChildren) {
            $result = [];
            foreach ($menus as $m) {
                if ($m->MMODULE !== $moduleCode) continue;
                if ((string) $m->MPARRENT !== (string) $parentCode) continue;

                $children = $buildChildren($m->MCODE, $moduleCode);

                $result[] = [
                    'text'     => $m->MNAME,
                    'MCODE'    => $m->MCODE,
                    'MODULE'   => $moduleCode,
                    'CONTROL'  => $m->MCONTROL ?: '-',
                    'MENUNAME' => $m->MNAME,
                    'checked'  => isset($accessSet[$m->MCODE]),
                    'leaf'     => count($children) === 0,
                    'expanded' => true,
                    'children' => $children,
                ];
            }
            return $result;
        };

        // Ambil semua baris ROOT (MPARRENT kosong/null) langsung sebagai node level teratas —
        // TIDAK ada lagi node pembungkus buatan dari menu_module.
        $rootNodes = $menus->filter(function ($m) {
            return empty($m->MPARRENT);
        })->sortBy(function ($m) use ($moduleOrder) {
            return $moduleOrder[$m->MMODULE] ?? 999;
        });

        $tree = [];
        foreach ($rootNodes as $m) {
            $children = $buildChildren($m->MCODE, $m->MMODULE);
            $tree[] = [
                'text'     => $m->MNAME,
                'MCODE'    => $m->MCODE,
                'MODULE'   => $m->MMODULE,
                'CONTROL'  => $m->MCONTROL ?: '-',
                'MENUNAME' => $m->MNAME,
                'checked'  => isset($accessSet[$m->MCODE]),
                'leaf'     => count($children) === 0,
                'expanded' => true,
                'children' => $children,
            ];
        }

        return $tree;
    }

    /**
     * Simpan perubahan centang (batch, hasil cascade parent->child sekaligus).
     */
    private function toggleAccess($payload)
    {
        $nvdata   = $payload['nvdata'] ?? [];
        $roleCode = $nvdata['ROLE_CODE'] ?? null;
        $changes  = $nvdata['changes'] ?? [];

        if (empty($roleCode) || empty($changes)) {
            throw new \Exception('Data perubahan akses tidak lengkap.');
        }

        DB::connection('sqlsrv')->transaction(function () use ($roleCode, $changes) {
            foreach ($changes as $c) {
                if (empty($c['MCODE'])) continue;

                if (!empty($c['checked'])) {
                    $exists = DB::connection('sqlsrv')->table('menu_role_access')
                        ->where('ROLE_CODE', $roleCode)
                        ->where('MCODE', $c['MCODE'])
                        ->exists();

                    if (!$exists) {
                        DB::connection('sqlsrv')->table('menu_role_access')->insert([
                            'ROLE_CODE'    => $roleCode,
                            'MCODE'        => $c['MCODE'],
                            'MALLOWCLICK'  => 1,
                            'CREATED_AT'   => now(),
                        ]);
                    }
                } else {
                    DB::connection('sqlsrv')->table('menu_role_access')
                        ->where('ROLE_CODE', $roleCode)
                        ->where('MCODE', $c['MCODE'])
                        ->delete();
                }
            }
        });

        return ['message' => 'Akses berhasil diperbarui.'];
    }
}