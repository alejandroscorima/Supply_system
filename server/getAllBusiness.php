<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$bd = include_once "bdData.php";



$sentencia = $bd->prepare(
    "SELECT a.company_name 
    FROM oscorp_data.companies a WHERE a.status = 'ACTIVO';"
);
//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
//$user = $sentencia->fetchAll(PDO::FETCH_OBJ);
$vehicle= $sentencia->fetchAll(PDO::FETCH_ASSOC);
// Muestra la consulta ejecutada
/* $sql = $sentencia->queryString;
echo "Consulta ejecutada: $sql <br>"; */


echo json_encode($vehicle);

?>

