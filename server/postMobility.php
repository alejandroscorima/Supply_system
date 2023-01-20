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


$jsonMobility = json_decode(file_get_contents("php://input"));
if (!$jsonMobility) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("insert into daily(fecha, sala, campus, monto, estado, user_id, hora_gen, fecha_gen) values (?,?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonMobility->fecha, $jsonMobility->sala, $jsonMobility->campus, $jsonMobility->monto, $jsonMobility->estado, $jsonMobility->user_id, $jsonMobility->hora_gen, $jsonMobility->fecha_gen]);
echo json_encode([
    "resultado" => $resultado,
]);
