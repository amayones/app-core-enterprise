/**
 * File: APP/AGLOBAL/login/Clogin.js
 * Class: APP.AGLOBAL.login.Clogin
 */
Ext.define('APP.AGLOBAL.login.Clogin', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Clogin',

    onPasswordEnter: function (field, e) {
        if (e.getKey() === e.ENTER) {
            this.onLoginClick();
        }
    },

    onLoginClick: function () {
        var view = this.getView();
        var username = view.down('#username').getValue();
        var password = view.down('#password').getValue();

        if (!username || !password) {
            COMP.TipToast.warn('Username dan password wajib diisi.');
            return;
        }

        COMP.run.getservice(vconfig.service_api + 'login', {
            username: username,
            password: password
        }, function (res) {
            if (res.success) {
                view.close();
                Ext.create('APP.AGLOBAL.viewport.viewport');
            } else {
                COMP.TipToast.error(res.message || 'Login gagal.');
            }
        }, this);
    }
});