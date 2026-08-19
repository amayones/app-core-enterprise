/**
 * vconfig
 * Konfigurasi global. File ini di-load PALING AWAL, sebelum app.js,
 * karena hampir semua komponen lain bergantung padanya.
 */
var vconfig = {
    namespace: 'APP',
    service_api: 'http://localhost:83/app/apservice/public/api/',   // apservice ada di DALAM folder app/
    app_title: 'app'
};