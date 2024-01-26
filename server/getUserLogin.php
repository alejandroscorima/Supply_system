
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$bd = include_once "bdData.php";

$doc_number=$_GET['doc_number'];

$sentencia = $bd->prepare("SELECT user_id, colab_id, type_doc, doc_number, 
first_name, paternal_surname, maternal_surname, gender, birth_date, civil_status,
 profession, cel_number, address, district, province, region, username, supply_role,
  latitud, longitud, photo_url 
  FROM oscorp_data.user2 
  WHERE doc_number='".$doc_number."' OR  username='".$username."' AND password='".$password."'");




//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
//$user = $sentencia->fetchAll(PDO::FETCH_OBJ);
$user = $sentencia->fetchObject();
//echo json_encode($mascotas);
echo json_encode($user);

?>
