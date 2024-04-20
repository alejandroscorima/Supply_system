
<?php
//$contraseña = "root";
$contraseña = "Oscorpsvr";
$usuario = "root";

$nombre_base_de_datos = "oscorp_paperless";
try {
    //return new PDO('mysql:host=192.168.4.250;dbname=' . $nombre_base_de_datos, $usuario, $contraseña);
    //return new PDO('mysql:host=172.31.80.161;dbname=' . $nombre_base_de_datos, $usuario, $contraseña);
    //return new PDO('mysql:host=localhost:8889;dbname=' . $nombre_base_de_datos, $usuario, $contraseña);
    return new PDO('mysql:host=localhost;dbname=' . $nombre_base_de_datos, $usuario, $contraseña);
} catch (Exception $e) {
    echo "Ocurrió algo con la base de datos: " . $e->getMessage();
}
