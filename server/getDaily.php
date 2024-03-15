<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$bd = include_once "bdLogistica.php";

$sentencia = $bd->prepare("SELECT fecha, h_inicio, h_fin, actividad, descripcion, user_id FROM daily ORDER BY fecha ASC");


//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$daily = $sentencia->fetchAll(PDO::FETCH_OBJ);
//$daily = $sentencia->fetchObject();
//echo json_encode($mascotas);
echo json_encode($daily);

?>
