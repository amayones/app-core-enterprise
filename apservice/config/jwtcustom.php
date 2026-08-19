<?php
return [
    'secret' => env('JWT_SECRET'),
    'expire_minutes' => env('JWT_EXPIRE_MINUTES', 480),
    'cookie_name' => 'app_token',
];
