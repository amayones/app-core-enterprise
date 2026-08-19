/**
 * COMP.TipToast
 * Wrapper notifikasi ringan, dipakai di seluruh aplikasi
 * supaya gaya notifikasi konsisten (bukan tiap modul bikin sendiri).
 */
Ext.define('COMP.TipToast', {
    singleton: true,

    success: function (msg) {
        this._show(msg, '#2e7d32');
    },

    info: function (msg) {
        this._show(msg, '#1565c0');
    },

    error: function (msg) {
        this._show(msg, '#c62828');
    },

    warn: function (msg) {
        this._show(msg, '#ef6c00');
    },

    _show: function (msg, color) {
        Ext.toast({
            html: msg,
            title: '',
            width: 320,
            align: 't',
            style: 'border-color:' + color,
            slideInDuration: 200,
            minWidth: 200
        });
    }
});
