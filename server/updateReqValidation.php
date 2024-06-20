
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonReq = json_decode(file_get_contents("php://input"));
if (!$jsonReq) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("UPDATE req_validations SET state = ? WHERE id = ?");
$resultado = $sentencia->execute([$jsonReq->status, $jsonReq->validation_id]);
echo json_encode($resultado);
