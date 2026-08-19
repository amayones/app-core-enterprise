/**
 * File: APP/MODSYSTEM/user_login/FRMuser_login.js
 * Class: APP.MODSYSTEM.user_login.FRMuser_login
 */
Ext.define('APP.MODSYSTEM.user_login.FRMuser_login', {
    extend: 'Ext.window.Window',
    alias: 'widget.FRMuser_login',
    controller: 'Cuser_login',

    requires: [
        'APP.MODSYSTEM.user_login.Cuser_login'
    ],

    title: 'Form User',
    modal: true,
    width: 440,
    layout: 'fit',
    autoShow: true,

    items: [{
        xtype: 'form',
        bodyPadding: 16,
        defaults: { anchor: '100%', labelWidth: 110 },
        items: [
            { xtype: 'hiddenfield', name: 'USER_ID' },
            { xtype: 'textfield', name: 'USERNAME', fieldLabel: 'Username', allowBlank: false },
            { xtype: 'textfield', name: 'FULLNAME', fieldLabel: 'Nama Lengkap', allowBlank: false },
            { xtype: 'textfield', name: 'EMAIL', fieldLabel: 'Email', vtype: 'email' },
            {
                xtype: 'combobox',
                itemId: 'comboDept',
                name: 'DEPT_ID',
                fieldLabel: 'Departemen',
                valueField: 'DEPT_ID',
                displayField: 'DEPT_NAME',
                queryMode: 'local',
                editable: false,
                forceSelection: true,
                store: { fields: ['DEPT_ID', 'DEPT_NAME'], data: [] }
            },
            {
                xtype: 'combobox',
                itemId: 'comboRole',
                name: 'ROLE_ID',
                fieldLabel: 'Role',
                valueField: 'ROLE_ID',
                displayField: 'ROLE_NAME',
                queryMode: 'local',
                editable: false,
                forceSelection: true,
                allowBlank: false,
                store: { fields: ['ROLE_ID', 'ROLE_NAME'], data: [] }
            },
            {
                xtype: 'textfield',
                name: 'PASSWORD',
                fieldLabel: 'Password',
                inputType: 'password',
                emptyText: '(kosongkan jika tidak ingin diubah)'
            },
            { xtype: 'checkbox', name: 'IS_ACTIVE', fieldLabel: 'Aktif', inputValue: '1', checked: true }
        ]
    }],

    buttons: [
        {
            text: 'Hapus',
            itemId: 'btnDelete',
            handler: 'onDeleteFormClick',
            hidden: true
        },
        '->',
        { text: 'Simpan', itemId: 'btnSave', handler: 'onSaveFormClick' },
        {
            text: 'Batal',
            handler: function (btn) { btn.up('window').close(); }
        }
    ]
});