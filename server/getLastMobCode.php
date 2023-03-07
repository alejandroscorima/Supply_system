
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$num=$_GET['num'];
$campus=$_GET['campus'];

$bd = include_once "bdLogistica.php";

$sentencia = $bd->prepare("SELECT numero FROM mobility WHERE numero LIKE '%".$num."%' AND campus='".$campus."' ORDER BY id DESC LIMIT 0, 1");

$sentencia->execute();
//$cliente = $sentencia->fetchObject();
$codigo = $sentencia->fetchObject();
//echo json_encode($cliente[$cliente.length()-1]);
echo json_encode($codigo);
