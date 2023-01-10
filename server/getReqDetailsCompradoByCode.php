
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$codigo=$_GET['codigo'];

$bd = include_once "bdLogistica.php";

//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");

$sentencia = $bd->prepare("SELECT id, req_codigo, cantidad, descripcion, tipo, estado, image_url, id_asignado, obs, f_inicio, h_inicio, f_atencion, h_atencion, f_compra, h_compra, f_final, h_final FROM req_detalles WHERE req_codigo='".$codigo."' AND estado='COMPRADO'");


/* if($tipo_usuario=='ASISTENTE'){
  $sentencia = $bd->prepare("SELECT id, codigo, fecha, area, encargado, sala, prioridad, motivo, id_asignado FROM requerimientos WHERE estado='ASIGNADO' AND id_asignado='".$id_asignado"'");
} */


//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$detalles = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($detalles);

?>
