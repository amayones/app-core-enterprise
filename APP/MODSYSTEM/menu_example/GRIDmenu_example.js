/**
 * File: APP/MODSYSTEM/menu_example/GRIDmenu_example.js
 * Class: APP.MODSYSTEM.menu_example.GRIDmenu_example
 */
Ext.define('APP.MODSYSTEM.menu_example.GRIDmenu_example', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.GRIDmenu_example',

    store: {
        fields: [
            'contoh1',
            'contoh2',
            'contoh3',
            'contoh4',
            'contoh5'
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
        {
            text: 'Contoh 1',
            dataIndex: 'contoh1',
            flex: 1
        },
        {
            text: 'Contoh 2',
            dataIndex: 'contoh2',
            width: 100
        },
        {
            text: 'Contoh 3',
            dataIndex: 'contoh3',
            flex: 1
        },
        {
            text: 'Contoh 4',
            dataIndex: 'contoh4',
            width: 120
        },
        {
            text: 'Contoh 5',
            dataIndex: 'contoh5',
            width: 100,
            renderer: function (v) {
                return v ? 'Ya' : 'Tidak';
            }
        }
    ],

    listeners: {
        itemdblclick: 'onDetailClick'
    }
});