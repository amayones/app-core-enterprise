/**
 * File: APP/MODSYSTEM/user_role/GRIDuser_role_list.js
 * Class: APP.MODSYSTEM.user_role.GRIDuser_role_list
 */
Ext.define('APP.MODSYSTEM.user_role.GRIDuser_role_list', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.GRIDuser_role_list',

    title: 'Role',
    hideHeaders: true,
    width: 260,
    region: 'west',
    split: true,

    store: {
        fields: ['ROLE_ID', 'ROLE_CODE', 'ROLE_NAME', 'IS_ACTIVE'],
        data: []
    },

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        layout: { type: 'hbox', align: 'stretch' },
        items: [
            {
                xtype: 'button',
                iconCls: 'x-fa fa-plus',
                tooltip: 'Tambah Role',
                handler: 'onAddRoleClick'
            },
            {
                xtype: 'textfield',
                emptyText: 'Cari role...',
                flex: 1,
                triggers: {
                    clear: {
                        cls: 'x-form-clear-trigger',
                        handler: 'onSearchClear'
                    }
                },
                listeners: { change: 'onSearchChange' }
            }
        ]
    }],

    columns: [
        { text: 'Role', dataIndex: 'ROLE_NAME', flex: 1 },
        {
            xtype: 'actioncolumn',
            width: 40,
            align: 'center',
            sortable: false,
            menuDisabled: true,
            items: [{
                iconCls: 'x-fa fa-times',
                tooltip: 'Hapus Role',
                handler: 'onDeleteRoleClick'
            }]
        }
    ],

    listeners: {
        select: 'onRoleSelect'
    }
});