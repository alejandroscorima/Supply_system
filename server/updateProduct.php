
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonItem = json_decode(file_get_contents("php://input"));
if (!$jsonItem) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("UPDATE products SET codigo = ?, descripcion = ?, val_sis = ?, um_sis = ?, val_prov = ?, um_prov = ?, provider = ? WHERE id = ?");
$resultado = $sentencia->execute([$jsonItem->codigo, $jsonItem->descripcion, $jsonItem->val_sis, $jsonItem->um_sis, $jsonItem->val_prov, $jsonItem->um_prov, $jsonItem->provider, $jsonItem->id]);
echo json_encode($resultado);
