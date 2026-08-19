/**
 * File: APP/MODSYSTEM/user_role/user_role.js
 * Class: APP.MODSYSTEM.user_role.user_role
 */
Ext.define('APP.MODSYSTEM.user_role.user_role', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.user_role',
    controller: 'Cuser_role',

    requires: [
        'APP.MODSYSTEM.user_role.Cuser_role',
        'APP.MODSYSTEM.user_role.GRIDuser_role_list',
        'APP.MODSYSTEM.user_role.TREEuser_role_access'
    ],

    title: 'User Role',
    layout: 'border',
    closable: true,

    items: [
        { xtype: 'GRIDuser_role_list', itemId: 'gridRoleList' },
        { xtype: 'TREEuser_role_access', itemId: 'treeMenuAccess' }
    ],

    listeners: {
        afterrender: 'onPanelReady'
    }
});