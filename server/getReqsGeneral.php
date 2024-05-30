
<?php
header("Access-Control-Allow-Origin: *");

$bd = include_once "bdLogistica.php";

$user_role=$_GET['user_role'];
$user_id=$_GET['user_id'];
$status=$_GET['status'];
$salas=$_GET['salas'];
$extraString="";

if($tipo_usuario=='SUPER USUARIO'){
}

if($tipo_usuario=='SUPER ADMINISTRADOR'){
}

if($tipo_usuario=='ADMINISTRADOR'){
}

if($tipo_usuario=='ASISTENTE'){
}

if($tipo_usuario=='USUARIO AVANZADO'){
}

if($tipo_usuario=='USUARIO'){
  $extraString.="AND a.user_id=".$user_id;
}

if($tipo_usuario=='SUPERVISOR'){
  $extraString="";
  if(!empty($salas)){
    $salasArray= explode(',',$salas);
    $extraString.="AND (";
    foreach($salasArray as $sala){
      $extraString.="sala = '".$sala."' OR ";
    }
    $extraString = rtrim($extraString, " OR ");
    $extraString.=")";
  }
}

$sentencia = $bd->prepare("SELECT a.id, a.codigo, a.fecha, a.area, a.encargado, a.sala, a.prioridad, a.motivo, a.id_asignado, a.estado, CASE
WHEN COUNT(b.id) = 0 THEN 'NO CORRESPONDE'
WHEN COUNT(b.id) = 1 THEN MAX(b.state)
WHEN COUNT(b.id) > 1 AND SUM(b.state = 'PENDIENTE') > 0 THEN 'PENDIENTE'
WHEN COUNT(b.id) > 1 AND SUM(b.state = 'PENDIENTE') = 0 AND COUNT(DISTINCT b.state) = 1 THEN MAX(b.state)
ELSE 'CONFLICTO'
END AS validation FROM requerimientos a LEFT JOIN req_validations b ON a.id=b.req_id WHERE a.estado='".$status."' ".$extraString." GROUP BY a.id ORDER BY a.id DESC");


//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$reqs = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($reqs);

?>
