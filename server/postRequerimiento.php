
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
// header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Methods: PUT");
// header("Access-Control-Allow-Methods: POST");
// header("Access-Control-Allow-Headers: *");

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    exit("Solo acepto peticiones POST");
}



$jsonReq = json_decode(file_get_contents("php://input"));
if (!$jsonReq) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("insert into requerimientos(codigo, fecha, area, encargado, sala, prioridad, motivo, id_asignado, estado, user_id) values (?,?,?,?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonReq->codigo, $jsonReq->fecha, $jsonReq->area, $jsonReq->encargado, $jsonReq->sala, $jsonReq->prioridad, $jsonReq->motivo, $jsonReq->id_asignado, $jsonReq->estado, $jsonReq->user_id]);
echo json_encode([
    "resultado" => $resultado,
]);
