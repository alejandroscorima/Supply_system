
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$bd = include_once "bdLogistica.php";

$estado=$_GET['estado'];

if($estado=='TODOS'){
    $sentencia = $bd->prepare("SELECT id, actividad, estado FROM activities");
}
else{
    $sentencia = $bd->prepare("SELECT id, actividad, estado FROM activities WHERE estado='".$estado."'");
}






//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$activities = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($activities);

?>
