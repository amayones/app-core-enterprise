/**
 * File: APP/MODSYSTEM/user_login/Cuser_login.js
 * Class: APP.MODSYSTEM.user_login.Cuser_login
 */
Ext.define('APP.MODSYSTEM.user_login.Cuser_login', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Cuser_login',

    // Cache pilihan dropdown Departemen & Role, biar tidak fetch ulang tiap buka form.
    deptOptions: [],
    roleOptions: [],

    // ---- Panel utama (grid) ----

    onPanelReady: function () {
        this.loadGrid();
        this.loadDropdownOptions();
    },

    loadGrid: function () {
        var view = this.getView();
        var grid = null;

        if (view && !view.destroyed) {
            grid = view.down('grid');
        }

        if (!grid || grid.destroyed) {
            var found = Ext.ComponentQuery.query('user_login grid')[0];
            if (found && !found.destroyed) {
                grid = found;
            }
        }

        if (!grid || grid.destroyed) {
            console.warn('Cuser_login: grid tidak tersedia.');
            return;
        }

        var me = this;

        COMP.run.getservice(vconfig.service_api + 'user_login/user_logins', {
            method: 'read'
        }, function (res) {
            if (res && res.success) {
                grid.getStore().loadData(res.data || []);
            } else {
                me.safeToast('error', (res && res.message) || 'Gagal memuat data user.');
            }
        }, me);
    },

    /**
     * Ambil daftar Departemen & Role untuk dropdown di form.
     * Dipanggil sekali saat panel dibuka, hasilnya di-cache di this.deptOptions/roleOptions.
     */
    loadDropdownOptions: function () {
        var me = this;

        COMP.run.getservice(vconfig.service_api + 'user_login/user_login', {
            method: 'dept_list'
        }, function (res) {
            if (res && res.success) {
                me.deptOptions = res.data || [];
            }
        }, me);

        COMP.run.getservice(vconfig.service_api + 'user_login/user_login', {
            method: 'role_list'
        }, function (res) {
            if (res && res.success) {
                me.roleOptions = res.data || [];
            }
        }, me);
    },

    onRefreshClick: function () {
        this.loadGrid();
    },

    safeToast: function (type, message) {
        try {
            if (COMP.TipToast && typeof COMP.TipToast[type] === 'function') {
                COMP.TipToast[type](message);
            } else {
                console.warn('COMP.TipToast.' + type + '() tidak ada. Pesan:', message);
            }
        } catch (e) {
            console.warn('Toast gagal ditampilkan:', e);
        }
    },

    onAddClick: function () {
        this.openForm(null);
    },

    onDetailClick: function (view, recordOrRowIndex) {
        var record = (recordOrRowIndex && recordOrRowIndex.isModel)
            ? recordOrRowIndex
            : arguments[5];

        if (!record) return;
        this.openForm(record);
    },

    openForm: function (record) {
        var win = Ext.create('APP.MODSYSTEM.user_login.FRMuser_login');
        var form = win.down('form');
        var btnDelete = win.down('#btnDelete');
        var comboDept = win.down('#comboDept');
        var comboRole = win.down('#comboRole');

        if (!form) {
            console.error('FRMuser_login: form tidak ditemukan.');
            return;
        }

        if (!btnDelete) {
            console.error('FRMuser_login: #btnDelete tidak ditemukan.');
            return;
        }

        // Isi dropdown dari cache. Kalau cache masih kosong (belum sempat load),
        // fallback fetch ulang supaya combo tidak kosong.
        if (comboDept) {
            if (this.deptOptions.length) {
                comboDept.getStore().loadData(this.deptOptions);
            } else {
                this.fetchAndFillCombo('dept_list', comboDept, 'deptOptions');
            }
        }
        if (comboRole) {
            if (this.roleOptions.length) {
                comboRole.getStore().loadData(this.roleOptions);
            } else {
                this.fetchAndFillCombo('role_list', comboRole, 'roleOptions');
            }
        }

        if (record) {
            win.setTitle('Detail User');
            form.getForm().loadRecord(record);
            btnDelete.show();
        } else {
            win.setTitle('Tambah User');
            btnDelete.hide();
        }

        win.show();
    },

    fetchAndFillCombo: function (method, combo, cacheKey) {
        var me = this;
        COMP.run.getservice(vconfig.service_api + 'user_login/user_login', {
            method: method
        }, function (res) {
            if (res && res.success) {
                me[cacheKey] = res.data || [];
                if (!combo.destroyed) {
                    combo.getStore().loadData(me[cacheKey]);
                }
            }
        }, me);
    },

    // ---- Form (window) ----

    onSaveFormClick: function (btn) {
        var win = btn.up('window');
        var form = win.down('form').getForm();
        var me = this;

        if (!form.isValid()) {
            this.safeToast('warn', 'Lengkapi field yang wajib diisi.');
            return;
        }

        var values = form.getValues();
        var method = values.USER_ID ? 'update' : 'insert';

        COMP.run.getservice(vconfig.service_api + 'user_login/user_login', {
            method: method,
            nvdata: values
        }, function (res) {
            if (res && res.success) {
                win.close();
                me.loadGrid();
                me.safeToast('info', (res.data && res.data.message) || 'Data tersimpan.');
            } else {
                me.safeToast('error', (res && res.message) || 'Gagal menyimpan data.');
            }
        }, me);
    },

    onDeleteFormClick: function (btn) {
        var win = btn.up('window');
        var form = win.down('form').getForm();
        var userId = form.findField('USER_ID').getValue();
        var userName = form.findField('FULLNAME').getValue();
        var me = this;

        if (!userId) return;

        Ext.Msg.confirm('Konfirmasi', 'Hapus user "' + userName + '"?', function (btnId) {
            if (btnId === 'yes') {
                COMP.run.getservice(vconfig.service_api + 'user_login/user_login', {
                    method: 'delete',
                    nvdata: { USER_ID: userId }
                }, function (res) {
                    if (res && res.success) {
                        win.close();
                        me.loadGrid();
                        me.safeToast('info', (res.data && res.data.message) || 'Berhasil dihapus.');
                    } else {
                        me.safeToast('error', (res && res.message) || 'Gagal menghapus data.');
                    }
                }, me);
            }
        });
    }
});