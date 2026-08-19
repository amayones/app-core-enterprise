<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtCookieMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $cookieName = config('jwtcustom.cookie_name');
        $token = $request->cookie($cookieName);

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak ditemukan, silakan login kembali.',
            ], 401);
        }

        try {
            $decoded = JWT::decode($token, new Key(config('jwtcustom.secret'), 'HS256'));
        } catch (ExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi telah berakhir, silakan login kembali.',
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid.',
            ], 401);
        }

        // Simpan data user hasil decode ke request, supaya bisa
        // dipakai oleh controller/model berikutnya (mis. audit log,
        // filter data per user, dsb).
        $request->attributes->set('auth_user', [
            'user_id'  => $decoded->user_id ?? null,
            'username' => $decoded->username ?? null,
            'role_id'  => $decoded->role_id ?? null,
        ]);

        return $next($request);
    }
}
