<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Modo mantenimiento si aplica
if (file_exists($maintenance = __DIR__.'/../backend/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Autoloader de Composer desde la carpeta privada del backend
require __DIR__.'/../backend/vendor/autoload.php';

// Asegurar que la cabecera Authorization de Sanctum pase en entornos Apache CGI/FastCGI/suPHP
if (empty($_SERVER['HTTP_AUTHORIZATION'])) {
    if (!empty($_SERVER['HTTP_X_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['HTTP_X_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_REDIRECT_HTTP_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (!empty($headers['X-Authorization'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['X-Authorization'];
        } elseif (!empty($headers['Authorization'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['Authorization'];
        } elseif (!empty($headers['authorization'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['authorization'];
        }
    }
}

// Bootstrap de la aplicación Laravel
/** @var Application $app */
$app = require_once __DIR__.'/../backend/bootstrap/app.php';

$app->handleRequest(Request::capture());

