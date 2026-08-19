/**
 * app.js — entry point.
 * Urutan load file di index.html HARUS:
 *   1. ExtJS library
 *   2. js/config/vconfig.js
 *   3. js/component/COMP.*.js
 *   4. app.js (file ini)
 */
Ext.Loader.setConfig({ enabled: true });

// INI YANG MEMBUAT SISTEM MENU DINAMIS BISA JALAN:
// setiap class "APP.xxx.yyy.zzz" otomatis di-mapping ke file
// "APP/xxx/yyy/zzz.js" tanpa perlu didaftarkan satu-satu.
Ext.Loader.setPath(vconfig.namespace, 'APP');

Ext.application({
    name: vconfig.namespace,

    launch: function () {
        // Cek status login dulu (mis. lewat endpoint ringan /me atau
        // langsung coba /reload — kalau 401, tampilkan login form).
        COMP.run.getservice(vconfig.service_api + 'reload', {}, function (res) {
            if (res.success) {
                Ext.create('APP.AGLOBAL.viewport.viewport');
            } else {
                this.showLogin();
            }
        }, this, false);
    },

    showLogin: function () {
        Ext.require('APP.AGLOBAL.login.login', function () {
            Ext.create('APP.AGLOBAL.login.login');
        });
    }
});