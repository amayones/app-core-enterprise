/**
 * File: APP/MODSYSTEM/user_role/Cuser_role.js
 * Class: APP.MODSYSTEM.user_role.Cuser_role
 */
Ext.define('APP.MODSYSTEM.user_role.Cuser_role', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Cuser_role',

    // Role yang lagi aktif dipilih di panel kiri.
    activeRole: null,

    // Flag untuk cegah event checkchange berantai saat proses cascade otomatis.
    suppressCascade: false,

    onPanelReady: function () {
        this.loadRoleList();
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

    // ---- Panel Kiri: daftar Group/Role ----

    loadRoleList: function () {
        var grid = this.getView().down('#gridRoleList');
        if (!grid) return;

        var me = this;
        COMP.run.getservice(vconfig.service_api + 'user_role/user_roles', {
            method: 'read'
        }, function (res) {
            if (res && res.success) {
                grid.getStore().loadData(res.data || []);
            } else {
                me.safeToast('error', (res && res.message) || 'Gagal memuat daftar group.');
            }
        }, me);
    },

    onSearchChange: function (field, value) {
        var grid = this.getView().down('#gridRoleList');
        var store = grid.getStore();

        store.clearFilter();
        if (value) {
            store.filterBy(function (rec) {
                return (rec.get('ROLE_NAME') || '').toLowerCase().indexOf(value.toLowerCase()) !== -1;
            });
        }
    },

    onSearchClear: function (field) {
        field.setValue('');
        this.onSearchChange(field, '');
    },

    onAddRoleClick: function () {
        var me = this;
        Ext.Msg.prompt('Tambah Role Baru', 'Nama Role:', function (btnId, text) {
            if (btnId === 'ok' && text) {
                COMP.run.getservice(vconfig.service_api + 'user_role/user_role', {
                    method: 'insert',
                    nvdata: { ROLE_NAME: text }
                }, function (res) {
                    if (res && res.success) {
                        me.safeToast('info', (res.data && res.data.message) || 'Role berhasil dibuat.');
                        me.loadRoleList();
                    } else {
                        me.safeToast('error', (res && res.message) || 'Gagal membuat role.');
                    }
                }, me);
            }
        });
    },

    onDeleteRoleClick: function (view, rowIndex, colIndex, item, e, record) {
        var me = this;

        Ext.Msg.confirm('Konfirmasi', 'Hapus role "' + record.get('ROLE_NAME') + '"?', function (btnId) {
            if (btnId === 'yes') {
                COMP.run.getservice(vconfig.service_api + 'user_role/user_role', {
                    method: 'delete',
                    nvdata: { ROLE_ID: record.get('ROLE_ID') }
                }, function (res) {
                    if (res && res.success) {
                        me.safeToast('info', (res.data && res.data.message) || 'Role berhasil dihapus.');
                        me.loadRoleList();

                        if (me.activeRole && me.activeRole.ROLE_ID === record.get('ROLE_ID')) {
                            me.activeRole = null;
                            var tree = me.getView().down('#treeMenuAccess');
                            if (tree) tree.getStore().setRoot({ expanded: true, children: [] });
                        }
                    } else {
                        me.safeToast('error', (res && res.message) || 'Gagal menghapus role.');
                    }
                }, me);
            }
        });
    },
    
    onRoleSelect: function (grid, record) {
        this.activeRole = {
            ROLE_ID: record.get('ROLE_ID'),
            ROLE_CODE: record.get('ROLE_CODE'),
            ROLE_NAME: record.get('ROLE_NAME')
        };
        this.loadMenuTree();
    },

    // ---- Panel Kanan: tree menu akses ----

    loadMenuTree: function () {
        var me = this;
        var tree = this.getView().down('#treeMenuAccess');
        if (!tree || !this.activeRole) return;

        tree.setTitle('Update Access Menu - ' + this.activeRole.ROLE_NAME);
        tree.setLoading(true);

        COMP.run.getservice(vconfig.service_api + 'user_role/user_role', {
            method: 'menu_tree',
            nvdata: { ROLE_CODE: this.activeRole.ROLE_CODE }
        }, function (res) {
            tree.setLoading(false);
            if (res && res.success) {
                me.injectGroupUserLabel(res.data, me.activeRole.ROLE_NAME);
                tree.getStore().setRoot({ expanded: true, children: res.data || [] });
            } else {
                me.safeToast('error', (res && res.message) || 'Gagal memuat menu.');
            }
        }, me);
    },

    // Isi kolom GROUP USER di tiap node dengan nama role yang lagi aktif (informasi saja).
    injectGroupUserLabel: function (nodes, roleName) {
        var me = this;
        (nodes || []).forEach(function (n) {
            n.GROUPUSER = roleName;
            if (n.children && n.children.length) {
                me.injectGroupUserLabel(n.children, roleName);
            }
        });
    },

    onMenuCheckChange: function (node, checked) {
        if (this.suppressCascade || !this.activeRole) return;

        var me = this;
        var changes = [];

        // Cascade: centang/uncentang otomatis ke semua anaknya.
        this.suppressCascade = true;
        node.cascadeBy(function (child) {
            child.set('checked', checked);
            if (child.get('MCODE')) {
                changes.push({ MCODE: child.get('MCODE'), checked: checked });
            }
        });
        this.suppressCascade = false;

        if (!changes.length) return;

        COMP.run.getservice(vconfig.service_api + 'user_role/user_role', {
            method: 'toggle_access',
            nvdata: { ROLE_CODE: this.activeRole.ROLE_CODE, changes: changes }
        }, function (res) {
            if (!(res && res.success)) {
                me.safeToast('error', (res && res.message) || 'Gagal menyimpan akses.');
            }
        }, me);
    }
});