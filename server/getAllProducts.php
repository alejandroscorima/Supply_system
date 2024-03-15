
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$ruc=$_GET['ruc'];

$bd = include_once "bdLogistica.php";

if($ruc=='TODOS'){
    $sentencia = $bd->prepare("SELECT id, codigo, descripcion, val_sis, um_sis, val_prov, um_prov, provider, unit_price, exonerado FROM products");
}
else{
    $sentencia = $bd->prepare("SELECT id, codigo, descripcion, val_sis, um_sis, val_prov, um_prov, provider, unit_price, exonerado FROM products WHERE provider='".$ruc."'");
}


//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$areas = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($areas);

?>
