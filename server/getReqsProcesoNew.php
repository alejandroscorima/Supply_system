
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$bd = include_once "bdLogistica.php";

$tipo_usuario=$_GET['tipo_usuario'];
$id_asignado=$_GET['id_asignado'];
$user_id=$_GET['user_id'];
$salas=$_GET['salas'];
$salasString="";
//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
if($tipo_usuario=='SUPER USUARIO'){
  $sentencia = $bd->prepare("SELECT id, codigo, fecha, area, encargado, sala, prioridad, motivo, id_asignado, estado FROM requerimientos WHERE estado<>'PENDIENTE' AND estado<>'FINALIZADO' ORDER BY id DESC");
}

if($tipo_usuario=='SUPER ADMINISTRADOR'){
  $sentencia = $bd->prepare("SELECT id, codigo, fecha, area, encargado, sala, prioridad, motivo, id_asignado, estado FROM requerimientos WHERE estado<>'PENDIENTE' AND estado<>'FINALIZADO' ORDER BY id DESC");
}

if($tipo_usuario=='ADMINISTRADOR'){
  $sentencia = $bd->prepare("SELECT id, codigo, fecha, area, encargado, sala, prioridad, motivo, id_asignado, estado FROM requerimientos WHERE estado<>'PENDIENTE' AND estado<>'FINALIZADO' AND id_asignado LIKE '%U".$id_asignado.",%' ORDER BY id DESC");
}

if($tipo_usuario=='ASISTENTE'){
  $sentencia = $bd->prepare("SELECT id, codigo, fecha, area, encargado, sala, prioridad, motivo, id_asignado, estado FROM requerimientos WHERE estado<>'PENDIENTE' AND estado<>'FINALIZADO' AND id_asignado LIKE '%U".$id_asignado.",%' ORDER BY id DESC");
}

if($tipo_usuario=='USUARIO AVANZADO'){
  $sentencia = $bd->prepare("SELECT id, codigo, fecha, area, encargado, sala, prioridad, motivo, id_asignado, estado FROM requerimientos WHERE user_id='".$user_id."' AND estado<>'PENDIENTE' AND estado<>'FINALIZADO' ORDER BY id DESC");
}

if($tipo_usuario=='USUARIO'){
  $sentencia = $bd->prepare("SELECT id, codigo, fecha, area, encargado, sala, prioridad, motivo, id_asignado, estado FROM requerimientos WHERE user_id='".$user_id."' AND estado<>'PENDIENTE' AND estado<>'FINALIZADO' ORDER BY id DESC");
}

if($tipo_usuario=='SUPERVISOR'){
  $salasString="";
  if(!empty($salas)){
    $salasArray= explode(',',$salas);
    foreach($salasArray as $sala){
      $salasString.="sala = '".$sala."' OR ";
    }
    $salasString = rtrim($salasString, " OR ");
  }
  else{
    $salasString.="true";
  }
  $sentencia = $bd->prepare("SELECT id, codigo, fecha, area, encargado, sala, prioridad, motivo, id_asignado, estado FROM requerimientos WHERE estado<>'PENDIENTE' AND estado<>'FINALIZADO' AND (".$salasString.") ORDER BY id DESC");
}


//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$reqs = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($reqs);

?>
