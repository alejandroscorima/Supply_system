
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
$sentencia = $bd->prepare("INSERT INTO vehicle_activity(vehicle_id, driver_id, destination_id, date_init, hour_init, km_depature, date_end, hour_end, km_arrival,fuel_price,fuel_gallons,status ) values (?,?,?,?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonVehicle->vehicle_id,$jsonVehicle->driver_id,$jsonVehicle->destination_id,$jsonVehicle->date_init, $jsonVehicle->hour_init, $jsonVehicle->km_depature, $jsonVehicle->date_end, $jsonVehicle->hour_end, $jsonVehicle->km_arrival,$jsonVehicle->fuel_price,$jsonVehicle->fuel_gallons, $jsonVehicle->status]);
echo json_encode([
    "resultado" => $resultado,
]);

