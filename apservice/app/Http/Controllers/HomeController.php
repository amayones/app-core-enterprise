<?php

namespace App\Http\Controllers;

use App\Models\BaseModel;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * POST /home/{A}/{B}
     *
     * Aturan dispatch (lihat dokumentasi arsitektur proyek):
     *   - B == A + "s"  -> panggil $model->read_data($payload)
     *   - B == A        -> baca payload['method'], panggil
     *                       $model->handleAction($method, $payload)
     *   - selainnya     -> panggil $model->{$B}($payload) langsung
     *
     * A dipetakan ke model class: App\Models\M{A}
     * (A diambil apa adanya / snake_case sesuai MCONTROL, TIDAK di-ubah ke PascalCase,
     *  supaya konsisten dengan konvensi "M" + MCONTROL persis)
     */
    public function general(Request $request, string $A, string $B)
    {
        $modelClass = 'App\\Models\\M' . $A;

        if (!class_exists($modelClass)) {
            return response()->json([
                'success' => false,
                'message' => "Modul '{$A}' tidak ditemukan (model {$modelClass} tidak ada).",
            ], 404);
        }

        /** @var BaseModel $model */
        $model = new $modelClass();
        $payload = $request->all();

        try {
            if ($B === $A . 's') {
                $result = $model->read_data($payload);
            } elseif ($B === $A) {
                $method = $payload['method'] ?? 'read';
                $result = $model->handleAction($method, $payload);
            } else {
                if (!method_exists($model, $B)) {
                    return response()->json([
                        'success' => false,
                        'message' => "Method '{$B}' tidak ditemukan di {$modelClass}.",
                    ], 404);
                }
                $result = $model->{$B}($payload);
            }

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            // Di production, jangan expose $e->getMessage() mentah-mentah
            // ke response kalau berisi info sensitif (nama SP, dsb).
            // Log dulu, baru kirim pesan generik.
            report($e);

            return response()->json([
                'success' => false,
                'message' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }
}
