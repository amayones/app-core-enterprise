/**
 * File: APP/MODSYSTEM/user_login/user_login.js
 * Class: APP.MODSYSTEM.user_login.user_login
 */
Ext.define('APP.MODSYSTEM.user_login.user_login', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.user_login',
    controller: 'Cuser_login',

    requires: [
        'APP.MODSYSTEM.user_login.Cuser_login',
        'APP.MODSYSTEM.user_login.GRIDuser_login'
    ],

    title: 'User Login',
    layout: 'fit',
    closable: true,

    items: [
        { xtype: 'GRIDuser_login', itemId: 'gridUser' }
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