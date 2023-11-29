
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$bd = include_once "bdData.php";

$user_id=$_GET['user_id'];

$sentencia = $bd->prepare("SELECT a.colab_id, a.user_id, a.area_id, COALESCE(b.name, 'NO ASIGNADO') AS area, a.campus_id, COALESCE(c.name, 'NO ASIGNADO') AS campus, a.position, a.raz_social, a.situation, a.service_unit, a.type_area, a.admission_date, a.cessation_date, a.colab_code FROM oscorp_data.collaborators a LEFT JOIN oscorp_data.areas b ON a.area_id=b.area_id LEFT JOIN oscorp_data.campus c ON a.campus_id=c.campus_id WHERE a.user_id=".$user_id." ORDER BY a.colab_id DESC LIMIT 1;");


//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
//$user = $sentencia->fetchAll(PDO::FETCH_OBJ);
$collaborator = $sentencia->fetchObject();
//echo json_encode($mascotas);
echo json_encode($collaborator);

?>
