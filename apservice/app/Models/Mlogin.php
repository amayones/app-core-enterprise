<?php

namespace App\Models;

class Mlogin extends BaseModel
{
    /**
     * Panggil SP_USERLOGIN_RELOAD dan susun ulang 5 result-set
     * menjadi struktur JSON yang rapi untuk frontend.
     */
    public function reload(string $username): array
    {
        $resultSets = $this->callProcedureMultiResultSet('SP_USERLOGIN_RELOAD', [
            '@USERNAME' => $username,
        ]);

        return [
            'appname'     => $resultSets[0][0] ?? null,
            'profile'     => $resultSets[1][0] ?? null,
            'dept'        => $resultSets[2][0] ?? null,
            'menu_module' => $resultSets[3] ?? [],
            'menu_access' => $resultSets[4] ?? [],
        ];
    }
}
