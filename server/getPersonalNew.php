
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$area_id=$_GET['area_id'];

$bd = include_once "bdData.php";

$sentencia = $bd->prepare("SELECT a.user_id, a.doc_number, a.first_name, a.paternal_surname, a.maternal_surname FROM oscorp_data.user2 a INNER JOIN oscorp_data.collaborators b ON a.colab_id=b.colab_id WHERE b.area_id=".$area_id." ORDER BY a.paternal_surname ASC");


//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$salas = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($salas);

?>
