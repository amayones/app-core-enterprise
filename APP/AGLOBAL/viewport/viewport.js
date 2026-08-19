/**
 * File: APP/AGLOBAL/viewport/viewport.js
 * Class: APP.AGLOBAL.viewport.viewport
 * (AGLOBAL = modul infrastruktur global, bukan modul bisnis biasa,
 *  tapi tetap ikut konvensi folder MODULE/CONTROL/CONTROL.js yang sama)
 */
Ext.define('APP.AGLOBAL.viewport.viewport', {
    extend: 'Ext.container.Viewport',
    alias: 'widget.appviewport',
    controller: 'Cviewport',

    requires: [
        'APP.AGLOBAL.viewport.Cviewport'
    ],

    layout: 'border',

    items: [
        {
            xtype: 'treepanel',
            itemId: 'menuTree',
            region: 'west',
            width: 280,
            title: 'Menu',
            collapsible: true,
            useArrows: true,
            rootVisible: false,
            store: {
                type: 'tree',
                root: { expanded: true, children: [] }
            },
            listeners: {
                itemclick: 'onMenuItemClick'
            }
        },
        {
            xtype: 'tabpanel',
            itemId: 'mainTabPanel',
            region: 'center'
        }
    ],

    listeners: {
        afterrender: 'onViewportReady'
    }
});