
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$id=$_GET['id'];

$bd = include_once "bdLogistica.php";

$sentencia = $bd->prepare("SELECT id, actividad, estado  FROM activities WHERE id=".$id);

$sentencia->execute();
//$cliente = $sentencia->fetchObject();
$activity = $sentencia->fetchObject();
//echo json_encode($cliente[$cliente.length()-1]);
echo json_encode($activity);
