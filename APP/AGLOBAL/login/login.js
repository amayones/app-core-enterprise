/**
 * File: APP/AGLOBAL/login/login.js
 * Class: APP.AGLOBAL.login.login
 */
Ext.define('APP.AGLOBAL.login.login', {
    extend: 'Ext.window.Window',
    alias: 'widget.applogin',
    controller: 'Clogin',

    requires: [
        'APP.AGLOBAL.login.Clogin'
    ],

    title: 'Login',
    modal: true,
    closable: false,
    width: 360,
    layout: 'form',
    bodyPadding: 16,
    autoShow: true,
    items: [
        {
            xtype: 'textfield',
            itemId: 'username',
            fieldLabel: 'Username',
            name: 'username',
            allowBlank: false
        },
        {
            xtype: 'textfield',
            itemId: 'password',
            fieldLabel: 'Password',
            name: 'password',
            inputType: 'password',
            allowBlank: false,
            listeners: {
                specialkey: 'onPasswordEnter'
            }
        }
    ],

    buttons: [
        { text: 'Login', itemId: 'btnLogin', handler: 'onLoginClick' }
    ],
});