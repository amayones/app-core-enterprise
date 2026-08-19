/**
 * File: APP/AGLOBAL/viewport/Cviewport.js
 * Class: APP.AGLOBAL.viewport.Cviewport
 */
Ext.define('APP.AGLOBAL.viewport.Cviewport', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Cviewport',

    onViewportReady: function () {
        this.doReload();
    },

    doReload: function () {
        var me = this;
        COMP.run.getservice(vconfig.service_api + 'reload', {}, function (res) {
            if (!res.success) {
                COMP.TipToast.error(res.message || 'Gagal memuat menu.');
                return;
            }
            me.buildMenuTree(res.data.menu_access || []);
        }, me);
    },

    /**
     * Normalisasi nilai BIT dari backend. JANGAN pakai truthy/falsy
     * mentah di sini: string "0" itu truthy di JavaScript.
     */
    toBool: function (v) {
        return v === true || v === 1 || v === '1';
    },

    buildMenuTree: function (menuAccessList) {
        var me = this;
        var tree = this.getView().down('#menuTree');

        var byCode = {};
        Ext.each(menuAccessList, function (item) {
            var isParent = me.toBool(item.MCHILDREN);
            byCode[item.MCODE] = Ext.apply({}, item, {
                text: item.MNAME,
                leaf: !isParent,
                expanded: me.toBool(item.MEXPAND),
                qtip: item.MQTIP,
                children: isParent ? [] : undefined
            });
        });

        var rootChildren = [];
        Ext.each(menuAccessList, function (item) {
            var node = byCode[item.MCODE];
            if (!item.MPARRENT || item.MPARRENT === '0') {
                rootChildren.push(node);
            } else if (byCode[item.MPARRENT]) {
                byCode[item.MPARRENT].children.push(node);
            }
        });

        var sortRecursive = function (nodes) {
            nodes.sort(function (a, b) { return (a.MSHORT || 0) - (b.MSHORT || 0); });
            Ext.each(nodes, function (n) {
                if (n.children) sortRecursive(n.children);
            });
        };
        sortRecursive(rootChildren);

        tree.getStore().setRoot({ expanded: true, children: rootChildren });
    },

    /**
     * Saat node diklik: kalau BUKAN leaf (folder), biarkan tree yang
     * handle expand/collapse — jangan buka tab apa pun.
     */
    onMenuItemClick: function (tree, record) {
        if (!record.get('leaf')) {
            return; // ini folder, bukan menu yang bisa dibuka
        }

        if (!this.toBool(record.get('MALLOWCLICK'))) {
            COMP.TipToast.warn('Anda tidak memiliki akses ke menu ini.');
            return;
        }

        var mmodule = record.get('MMODULE');
        var mcontrol = record.get('MCONTROL');

        if (!mcontrol) {
            return;
        }

        var className = Ext.String.format(
            '{0}.{1}.{2}.{3}',
            vconfig.namespace, mmodule, mcontrol, mcontrol
        );

        this.openModuleTab(className, mcontrol, record.get('MNAME'));
    },

    openModuleTab: function (className, mcontrol, title) {
        var tabPanel = this.getView().down('#mainTabPanel');
        var tabId = 'tab_' + mcontrol;

        var existingTab = tabPanel.child('#' + tabId);
        if (existingTab) {
            tabPanel.setActiveTab(existingTab);
            return;
        }

        Ext.getBody().mask('Membuka modul...', 'x-mask-loading');

        Ext.require(className, function () {
            Ext.getBody().unmask();

            var panel = Ext.create(className, {
                itemId: tabId,
                closable: true,
                title: title
            });

            tabPanel.add(panel);
            tabPanel.setActiveTab(panel);
        }, this, function () {
            Ext.getBody().unmask();
            COMP.TipToast.error('Gagal memuat modul "' + className + '". Cek apakah file-nya ada.');
        });
    },

    /**
     * Logout: panggil API /logout (hapus JWT cookie),
     * lalu hancurkan viewport dan kembali ke form login.
     */
    onLogoutClick: function () {
        var me = this;

        Ext.Msg.confirm(
            'Konfirmasi',
            'Anda yakin ingin keluar?',
            function (btn) {
                if (btn !== 'yes') {
                    return;
                }

                COMP.run.getservice(
                    vconfig.service_api + 'logout',
                    {},
                    function (res) {
                        if (res.success) {
                            COMP.TipToast.info('Anda berhasil keluar.');

                            me.getView().destroy();

                            Ext.getApplication().showLogin();
                        } else {
                            COMP.TipToast.error(res.message || 'Gagal logout.');
                        }
                    },
                    me,
                    false  // tidak perlu loading mask — operasi cepat
                );
            }
        );
    }
});
