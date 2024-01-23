
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonLiq = json_decode(file_get_contents("php://input"));
if (!$jsonLiq) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("UPDATE entregaliquidaciones SET estado = ? WHERE id = ?");
$resultado = $sentencia->execute([$jsonLiq->estado, $jsonLiq->id]);
echo json_encode($resultado);
