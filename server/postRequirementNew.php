<?php
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
$sentencia = $bd->prepare("insert into requerimientos(codigo, fecha, area, encargado, sala, prioridad, motivo, id_asignado, estado, user_id, validation, total_budget, campus_id) values (?,?,?,?,?,?,?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([
    $jsonReq->codigo, 
    $jsonReq->fecha, 
    $jsonReq->area, 
    $jsonReq->encargado, 
    $jsonReq->sala, 
    $jsonReq->prioridad, 
    $jsonReq->motivo, 
    $jsonReq->id_asignado, 
    $jsonReq->estado, 
    $jsonReq->user_id, 
    $jsonReq->validation,
    $jsonReq->total_budget,
    $jsonReq->campus_id
]);

if ($resultado) {
    $lastInsertId = $bd->lastInsertId();
    echo json_encode([
        "resultado" => $resultado,
        "id" => $lastInsertId
    ]);
} else {
    echo json_encode([
        "resultado" => $resultado,
        "error" => $sentencia->errorInfo()
    ]);
}