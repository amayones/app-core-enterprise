/**
 * File: APP/MODSYSTEM/user_login/GRIDuser_login.js
 * Class: APP.MODSYSTEM.user_login.GRIDuser_login
 */
Ext.define('APP.MODSYSTEM.user_login.GRIDuser_login', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.GRIDuser_login',

    store: {
        fields: [
            'USER_ID', 'USERNAME', 'FULLNAME', 'EMAIL',
            'DEPT_ID', 'DEPT_NAME', 'ROLE_ID', 'ROLE_NAME',
            'IS_ACTIVE', 'LAST_LOGIN'
        ],
        data: []
    },

    columns: [
        {
            xtype: 'rownumberer',
            text: 'No',
            width: 50,
            align: 'center'
        },
        {
            xtype: 'actioncolumn',
            text: '',
            width: 60,
            align: 'center',
            sortable: false,
            menuDisabled: true,
            items: [{
                iconCls: 'x-fa fa-file-text-o',
                tooltip: 'Detail',
                handler: 'onDetailClick'
            }]
        },
        { text: 'Username', dataIndex: 'USERNAME', width: 130 },
        { text: 'Nama Lengkap', dataIndex: 'FULLNAME', flex: 1 },
        { text: 'Email', dataIndex: 'EMAIL', width: 180 },
        { text: 'Departemen', dataIndex: 'DEPT_NAME', width: 150 },
        { text: 'Role', dataIndex: 'ROLE_NAME', width: 120 },
        {
            text: 'Aktif',
            dataIndex: 'IS_ACTIVE',
            width: 70,
            renderer: function (v) { return v ? 'Ya' : 'Tidak'; }
        },
        {
            text: 'Login Terakhir',
            dataIndex: 'LAST_LOGIN',
            width: 140,
            renderer: Ext.util.Format.dateRenderer('d/m/Y H:i')
        }
    ],

    listeners: {
        itemdblclick: 'onDetailClick'
    }
});