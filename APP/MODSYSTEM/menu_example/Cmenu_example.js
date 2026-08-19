/**
 * File: APP/MODSYSTEM/menu_example/Cmenu_example.js
 * Class: APP.MODSYSTEM.menu_example.Cmenu_example
 */
Ext.define('APP.MODSYSTEM.menu_example.Cmenu_example', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Cmenu_example',

    // ---- Panel utama (grid) ----

    onPanelReady: function () {
        this.loadGrid();
    },

    loadGrid: function () {
        var view = this.getView();
        var grid = null;

        if (view && !view.destroyed) {
            grid = view.down('grid');
        }

        if (!grid || grid.destroyed) {
            var found = Ext.ComponentQuery.query('menu_example grid')[0];

            if (found && !found.destroyed) {
                grid = found;
            }
        }

        if (!grid || grid.destroyed) {
            console.warn('Cmenu_example: grid tidak tersedia.');
            return;
        }

        var me = this;

        COMP.run.getservice(
            vconfig.service_api + 'menu_example/menu_examples',
            {
                method: 'read'
            },
            function (res) {
                if (res && res.success) {
                    grid.getStore().loadData(res.data || []);
                }
            },
            me
        );
    },

    onRefreshClick: function () {
        this.loadGrid();
    },

    // ---- Toast ----

    safeToast: function (type, message) {
        try {
            if (
                COMP.TipToast &&
                typeof COMP.TipToast[type] === 'function'
            ) {
                COMP.TipToast[type](message);
            } else {
                console.warn(
                    'COMP.TipToast.' + type + '() tidak ada. Pesan:',
                    message
                );
            }
        } catch (e) {
            console.warn('Toast gagal ditampilkan:', e);
        }
    },

    // ---- Grid ----

    onAddClick: function () {
        this.openForm(null);
    },

    onDetailClick: function (view, recordOrRowIndex) {
        var record = (
            recordOrRowIndex &&
            recordOrRowIndex.isModel
        )
            ? recordOrRowIndex
            : arguments[5];

        if (!record) {
            return;
        }

        this.openForm(record);
    },

    openForm: function (record) {
        var win = Ext.create(
            'APP.MODSYSTEM.menu_example.FRMmenu_example'
        );

        var form = win.down('form');
        var btnDelete = win.down('#btnDelete');

        if (!form) {
            console.error(
                'FRMmenu_example: form tidak ditemukan.'
            );
            return;
        }

        if (!btnDelete) {
            console.error(
                'FRMmenu_example: #btnDelete tidak ditemukan.'
            );
            return;
        }

        if (record) {
            win.setTitle('Detail Menu Example');

            form.getForm().loadRecord(record);

            btnDelete.show();
        } else {
            win.setTitle('Tambah Menu Example');

            btnDelete.hide();
        }

        win.show();
    },

    // ---- Form ----

    onSaveFormClick: function (btn) {
        var win = btn.up('window');
        var form = win.down('form').getForm();
        var me = this;

        if (!form.isValid()) {
            this.safeToast(
                'warn',
                'Lengkapi field yang wajib diisi.'
            );
            return;
        }

        var values = form.getValues();

        // Jika ada ID = update, jika tidak = insert
        var method = values.id
            ? 'update'
            : 'insert';

        COMP.run.getservice(
            vconfig.service_api + 'menu_example/menu_example',
            {
                method: method,
                nvdata: values
            },
            function (res) {
                if (res && res.success) {
                    win.close();

                    me.loadGrid();

                    me.safeToast(
                        'info',
                        (res.data && res.data.message) ||
                        'Data tersimpan.'
                    );
                } else {
                    me.safeToast(
                        'error',
                        (res && res.message) ||
                        'Gagal menyimpan data.'
                    );
                }
            },
            me
        );
    },

    onDeleteFormClick: function (btn) {
        var win = btn.up('window');
        var form = win.down('form').getForm();

        var id = form.findField('id').getValue();
        var contoh1 = form.findField('contoh1').getValue();

        var me = this;

        if (!id) {
            return;
        }

        Ext.Msg.confirm(
            'Konfirmasi',
            'Hapus data "' + contoh1 + '"?',
            function (btnId) {
                if (btnId === 'yes') {
                    COMP.run.getservice(
                        vconfig.service_api +
                        'menu_example/menu_example',
                        {
                            method: 'delete',
                            nvdata: {
                                id: id
                            }
                        },
                        function (res) {
                            if (res && res.success) {
                                win.close();

                                me.loadGrid();

                                me.safeToast(
                                    'info',
                                    (res.data &&
                                        res.data.message) ||
                                    'Berhasil dihapus.'
                                );
                            } else {
                                me.safeToast(
                                    'error',
                                    (res &&
                                        res.message) ||
                                    'Gagal menghapus data.'
                                );
                            }
                        },
                        me
                    );
                }
            }
        );
    }
});