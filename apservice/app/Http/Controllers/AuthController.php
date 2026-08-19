<?php

namespace App\Http\Controllers;

use App\Models\Mlogin;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cookie;

class AuthController extends Controller
{
    /**
     * POST /login
     * body: { username, password }
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = DB::connection('sqlsrv')
            ->table('m_user')
            ->where('USERNAME', $request->username)
            ->where('IS_ACTIVE', 1)
            ->first();

        // dd($user);
        if (!$user || !password_verify($request->password, $user->PASSWORD_HASH)) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau password salah.',
            ], 401);
        }

        $expireMinutes = (int) config('jwtcustom.expire_minutes');
        $payload = [
            'user_id'  => $user->USER_ID,
            'username' => $user->USERNAME,
            'role_id'  => $user->ROLE_ID,
            'iat'      => time(),
            'exp'      => time() + ($expireMinutes * 60),
        ];

        $token = JWT::encode($payload, config('jwtcustom.secret'), 'HS256');

        $cookie = Cookie::make(
            config('jwtcustom.cookie_name'),
            $token,
            $expireMinutes,
            '/',
            null,
            app()->environment('production'), // secure — true otomatis saat production (HTTPS), false saat local (HTTP)
            true,   // httpOnly — tidak bisa diakses JS, mitigasi XSS
            false,
            'Lax'
        );

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
        ])->withCookie($cookie);
    }

    /**
     * POST /logout
     */
    public function logout(Request $request)
    {
        return response()->json(['success' => true])
            ->withCookie(Cookie::forget(config('jwtcustom.cookie_name')));
    }

    /**
     * POST /reload
     * Dipanggil setelah login sukses, atau setiap kali frontend
     * butuh refresh profile + menu (mis. reload halaman).
     * Wajib lewat middleware jwt.cookie.
     */
    public function reload(Request $request)
    {
        $authUser = $request->attributes->get('auth_user');

        $model = new Mlogin();
        $data = $model->reload($authUser['username']);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
