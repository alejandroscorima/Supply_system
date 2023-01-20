<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$campus=$_GET['campus'];

$bd = include_once "bdLogistica.php";

$sentencia = $bd->prepare("SELECT fecha, campus, monto, estado, user_id, hora_gen, fecha_gen FROM mobility WHERE campus = '".$campus."' ORDER BY fecha ASC");


//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$mobility = $sentencia->fetchAll(PDO::FETCH_OBJ);
//$daily = $sentencia->fetchObject();
//echo json_encode($mascotas);
echo json_encode($mobility);

?>
