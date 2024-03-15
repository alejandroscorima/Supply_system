
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$bd = include_once "bdLogistica.php";

//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");

$sentencia = $bd->prepare("SELECT a.first_name NOMBRE, a.last_name APELLIDO, SUM(b.estado='ASIGNADO') PENDIENTE, SUM(b.estado='COMPRADO') COMPRADO, SUM(b.estado='ENTREGADO') ENTREGADO, COUNT(*) ASIGNADO FROM oscorp_data.users a INNER JOIN oscorp_supply.req_detalles b ON a.user_id=b.id_asignado GROUP BY b.id_asignado");


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
