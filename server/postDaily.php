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


$jsonDaily = json_decode(file_get_contents("php://input"));
if (!$jsonDaily) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("insert into daily(fecha, h_inicio, h_fin, actividad, descripcion, user_id) values (?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonDaily->fecha, $jsonDaily->h_inicio, $jsonDaily->h_fin, $jsonDaily->actividad, $jsonDaily->descripcion, $jsonDaily->user_id]);
echo json_encode([
    "resultado" => $resultado,
]);
