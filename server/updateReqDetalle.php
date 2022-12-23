
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
$sentencia = $bd->prepare("UPDATE req_detalles SET cantidad = ?, descripcion = ?, tipo = ?, estado = ?, id_asignado = ? WHERE id = ?");
$resultado = $sentencia->execute([$jsonItem->cantidad, $jsonItem->descripcion, $jsonItem->tipo, $jsonItem->estado, $jsonItem->id_asignado, $jsonItem->id]);
echo json_encode($resultado);
