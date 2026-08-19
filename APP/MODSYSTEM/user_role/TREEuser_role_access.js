/**
 * File: APP/MODSYSTEM/user_role/TREEuser_role_access.js
 * Class: APP.MODSYSTEM.user_role.TREEuser_role_access
 */
Ext.define('APP.MODSYSTEM.user_role.TREEuser_role_access', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.TREEuser_role_access',

    title: 'Update Access Menu',
    region: 'center',
    rootVisible: false,
    useArrows: true,

    store: {
        root: { expanded: true, children: [] }
    },

    columns: [
        { xtype: 'treecolumn', text: 'Menu Akses', dataIndex: 'text', flex: 2 },
        { text: 'Module', dataIndex: 'MODULE', flex: 1 },
        { text: 'Control', dataIndex: 'CONTROL', width: 130 },
        { text: 'Menu Name', dataIndex: 'MENUNAME', flex: 1 },
        { text: 'Code', dataIndex: 'MCODE', width: 110 },
        { text: 'Group User', dataIndex: 'GROUPUSER', width: 140 }
    ],

    listeners: {
        checkchange: 'onMenuCheckChange'
    }
});