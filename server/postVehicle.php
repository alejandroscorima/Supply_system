
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



$jsonVehicle = json_decode(file_get_contents("php://input"));
if (!$jsonVehicle) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("INSERT INTO vehicle(plate, type, year, brand, model, business, status) values (?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonVehicle->plate, $jsonVehicle->type, $jsonVehicle->year, $jsonVehicle->brand, $jsonVehicle->model, $jsonVehicle->business, $jsonVehicle->status]);
echo json_encode([
    "resultado" => $resultado,
]);
