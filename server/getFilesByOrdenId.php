<?php
header("Access-Control-Allow-Origin: *");

$orden_id = $_GET['orden_id'];

$bd = include_once "bdLogistica.php";

$sentencia = $bd->prepare("SELECT id, name, url, description, extension, date, hour, order_id, folder_id FROM oscorp_paperless.file WHERE order_id =".$orden_id." ");



$sentencia->execute();

$files = $sentencia->fetchAll(PDO::FETCH_OBJ);

echo json_encode($files);
?>
