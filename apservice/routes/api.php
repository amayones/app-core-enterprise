<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Route publik (tanpa JWT)
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Route terproteksi (wajib JWT valid via cookie)
|--------------------------------------------------------------------------
*/
Route::middleware('jwt.cookie')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/reload', [AuthController::class, 'reload']);

    // Endpoint generik untuk SEMUA modul — tidak perlu tambah route baru
    // setiap kali ada modul baru. Cukup buat model M<Control>.
    Route::post('/{A}/{B}', [HomeController::class, 'general']);
});
