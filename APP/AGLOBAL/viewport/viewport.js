/**
 * File: APP/AGLOBAL/viewport/viewport.js
 * Class: APP.AGLOBAL.viewport.viewport
 */
Ext.define('APP.AGLOBAL.viewport.viewport', {
    extend: 'Ext.container.Viewport',
    alias: 'widget.appviewport',
    controller: 'Cviewport',

    requires: [
        'APP.AGLOBAL.viewport.Cviewport'
    ],

    layout: 'border',

    // samakan tinggi header di seluruh viewport
    headerHeight: 34,

    items: [
        {
            xtype: 'treepanel',
            itemId: 'menuTree',
            region: 'west',
            width: 280,
            title: 'Menu',
            collapsible: true,
            floatable: false,
            useArrows: true,
            rootVisible: false,
            header: {
                height: 50
            },
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
            region: 'center',

            tabBar: {
                height: 50, 
                layout: {
                    type: 'hbox',
                    align: 'middle',
                    pack: 'start'
                },
                items: [
                    {
                        xtype: 'component',
                        flex: 1
                    },
                    {
                        xtype: 'button',
                        text: '',
                        iconCls: 'x-fa fa-sign-out',
                        handler: 'onLogoutClick',
                        margin: '0 8 0 0' ,
                        padding: 4
                    }
                ]
            }
        }
    ],

    listeners: {
        afterrender: 'onViewportReady'
    }
});