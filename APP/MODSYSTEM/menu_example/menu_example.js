/**
 * File: APP/MODSYSTEM/menu_example/menu_example.js
 * Class: APP.MODSYSTEM.menu_example.menu_example
 */
Ext.define('APP.MODSYSTEM.menu_example.menu_example', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.menu_example',
    controller: 'Cmenu_example',

    requires: [
        'APP.MODSYSTEM.menu_example.Cmenu_example',
        'APP.MODSYSTEM.menu_example.GRIDmenu_example'
    ],

    title: 'Daftar Supplier',
    layout: 'fit',
    closable: true,

    items: [
        { xtype: 'GRIDmenu_example', itemId: 'gridSupplier' }
    ],

    tbar: [
        { text: 'Tambah', itemId: 'btnAdd', handler: 'onAddClick' },
        '->',
        { text: 'Refresh', handler: 'onRefreshClick' }
    ],

    listeners: {
        afterrender: 'onPanelReady'
    }
});