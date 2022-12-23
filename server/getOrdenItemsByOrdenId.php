
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$ord_id=$_GET['ord_id'];

$bd = include_once "bdLogistica.php";

//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");

$sentencia = $bd->prepare("SELECT id, ord_codigo, cantidad, descripcion, unit_price, subtotal FROM ord_detalles WHERE ord_codigo='".$ord_id."'");


/* if($tipo_usuario=='ASISTENTE'){
  $sentencia = $bd->prepare("SELECT id, codigo, fecha, area, encargado, sala, prioridad, motivo, id_asignado FROM requerimientos WHERE estado='ASIGNADO' AND id_asignado='".$id_asignado"'");
} */


//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$fondoItems = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($fondoItems);

?>
