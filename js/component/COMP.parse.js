/**
 * COMP.parse
 * Parsing response dari Ext.Ajax secara aman.
 */
Ext.define('COMP.parse', {
    singleton: true,

    json: function (response) {
        try {
            return Ext.decode(response.responseText);
        } catch (e) {
            return {
                success: false,
                message: 'Response dari server tidak valid (bukan JSON).'
            };
        }
    }
});