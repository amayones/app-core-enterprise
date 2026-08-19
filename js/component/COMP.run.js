/**
 * COMP.run
 * Helper AJAX generik. SEMUA request ke backend lewat sini,
 * supaya penanganan cookie, error, dan loading mask konsisten
 * di seluruh aplikasi.
 */
Ext.define('COMP.run', {
    singleton: true,

    /**
     * @param {String} url          endpoint lengkap, mis. vconfig.service_api + "supplier_list/supplier_lists"
     * @param {Object} params       payload yang dikirim sebagai JSON body
     * @param {Function} callback   dipanggil dengan (result) setelah response diterima
     * @param {Object} scope        scope untuk callback
     * @param {Boolean} showMask    tampilkan loading mask global, default true
     */
    getservice: function (url, params, callback, scope, showMask) {
        if (showMask !== false) {
            Ext.getBody().mask('Memuat...', 'x-mask-loading');
        }

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            jsonData: params || {},
            withCredentials: true, // WAJIB: supaya cookie HttpOnly (JWT) ikut terkirim
            success: function (response) {
                Ext.getBody().unmask();
                var res = COMP.parse.json(response);
                if (callback) {
                    callback.call(scope || this, res);
                }
            },
            failure: function (response) {
                Ext.getBody().unmask();

                var res = COMP.parse.json(response);

                // Untuk 401, JANGAN otomatis reload/redirect di sini —
                // biarkan pemanggil (mis. app.js saat launch, atau
                // Cviewport saat sesi habis di tengah pemakaian) yang
                // memutuskan apa yang harus terjadi lewat callback.
                // Toast error tetap ditampilkan kecuali untuk 401 supaya
                // tidak mengganggu alur cek-status-login yang normal.
                if (response.status !== 401) {
                    COMP.TipToast.error(res.message || 'Terjadi kesalahan pada server.');
                }

                if (callback) {
                    callback.call(scope || this, res);
                }
            }
        });
    }
});