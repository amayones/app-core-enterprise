/**
 * File: APP/MODSYSTEM/menu_example/FRMmenu_example.js
 * Class: APP.MODSYSTEM.menu_example.FRMmenu_example
 */
Ext.define('APP.MODSYSTEM.menu_example.FRMmenu_example', {
    extend: 'Ext.window.Window',
    alias: 'widget.FRMmenu_example',
    controller: 'Cmenu_example',

    requires: [
        'APP.MODSYSTEM.menu_example.Cmenu_example'
    ],

    title: 'Form Menu Example',
    modal: true,
    width: 420,
    layout: 'fit',
    autoShow: true,

    items: [{
        xtype: 'form',
        bodyPadding: 16,
        defaults: {
            anchor: '100%',
            labelWidth: 110
        },
        items: [
            {
                xtype: 'hiddenfield',
                name: 'id'
            },
            {
                xtype: 'textfield',
                name: 'contoh1',
                fieldLabel: 'Contoh 1',
                allowBlank: false
            },
            {
                xtype: 'numberfield',
                name: 'contoh2',
                fieldLabel: 'Contoh 2',
                allowBlank: false
            },
            {
                xtype: 'textareafield',
                name: 'contoh3',
                fieldLabel: 'Contoh 3'
            },
            {
                xtype: 'numberfield',
                name: 'contoh4',
                fieldLabel: 'Contoh 4',
                decimalPrecision: 2
            },
            {
                xtype: 'checkbox',
                name: 'contoh5',
                fieldLabel: 'Contoh 5',
                inputValue: '1',
                uncheckedValue: '0'
            }
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
        {
            text: 'Simpan',
            itemId: 'btnSave',
            handler: 'onSaveFormClick'
        },
        {
            text: 'Batal',
            handler: function (btn) {
                btn.up('window').close();
            }
        }
    ]
});