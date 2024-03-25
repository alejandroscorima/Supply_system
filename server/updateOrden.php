
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonOrd = json_decode(file_get_contents("php://input"));
if (!$jsonOrd) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("UPDATE ordenes SET estado = ?, receipt = ?, txt = ?, status = ? WHERE id = ?");
$resultado = $sentencia->execute([$jsonOrd->estado, $jsonOrd->receipt, $jsonOrd->txt, $jsonOrd->id, $jsonOrd->status]);
echo json_encode($resultado);
