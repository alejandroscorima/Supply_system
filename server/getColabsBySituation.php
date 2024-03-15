<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$bd = include_once "bdData.php";

$situation=$_GET['situation'];

$sentencia = $bd->prepare("SELECT a.user_id, b.colab_id, a.type_doc, a.doc_number, a.first_name, a.paternal_surname, a.maternal_surname, a.gender, c.name area, d.name campus, b.position, b.raz_social, b.service_unit, b.type_area FROM oscorp_data.user2 a RIGHT JOIN oscorp_data.collaborators b ON b.user_id=a.user_id AND b.situation='".$situation."' INNER JOIN oscorp_data.areas c ON b.area_id=c.area_id INNER JOIN oscorp_data.campus d ON b.campus_id=d.campus_id;");

//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$colabs = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($colabs);

?>