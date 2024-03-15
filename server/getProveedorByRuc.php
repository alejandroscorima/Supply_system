
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$ruc=$_GET['ruc'];

$bd = include_once "bdLogistica.php";

$sentencia = $bd->prepare("SELECT id, ruc, razon_social, direccion, cci, estado, categoria FROM proveedores WHERE ruc='".$ruc."'");

$sentencia->execute();
//$cliente = $sentencia->fetchObject();
$proveedor = $sentencia->fetchObject();
//echo json_encode($cliente[$cliente.length()-1]);
echo json_encode($proveedor);
