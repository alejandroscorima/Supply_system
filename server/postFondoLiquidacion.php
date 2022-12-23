
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



$jsonFondoLiquidacion = json_decode(file_get_contents("php://input"));
if (!$jsonFondoLiquidacion) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("insert into fondoliquidaciones(fecha,campus,campus_dir,numero,importe,personal, empresa, user_id) values (?,?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonFondoLiquidacion->fecha, $jsonFondoLiquidacion->campus, $jsonFondoLiquidacion->campus_dir, $jsonFondoLiquidacion->numero, $jsonFondoLiquidacion->importe, $jsonFondoLiquidacion->personal, $jsonFondoLiquidacion->empresa, $jsonFondoLiquidacion->user_id]);
echo json_encode([
    "resultado" => $resultado,
]);
