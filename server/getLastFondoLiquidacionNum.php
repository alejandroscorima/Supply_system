
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$num=$_GET['num'];
$campus=$_GET['campus'];
$empresa=$_GET['empresa'];

$bd = include_once "bdLogistica.php";

$sentencia = $bd->prepare("SELECT numero FROM fondoliquidaciones WHERE numero LIKE '%".$num."%' AND campus='".$campus."' AND empresa='".$empresa."' ORDER BY id DESC LIMIT 0, 1");

$sentencia->execute();
//$cliente = $sentencia->fetchObject();
$codigo = $sentencia->fetchObject();
//echo json_encode($cliente[$cliente.length()-1]);
echo json_encode($codigo);
