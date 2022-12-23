
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



$jsonOrdDet = json_decode(file_get_contents("php://input"));
if (!$jsonOrdDet) {
    exit("No hay datos");
}
$bd = include_once "bdLogistica.php";
$sentencia = $bd->prepare("insert into ord_detalles(ord_codigo, cantidad, descripcion, unit_price, subtotal) values (?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonOrdDet->ord_codigo, $jsonOrdDet->cantidad, $jsonOrdDet->descripcion, $jsonOrdDet->unit_price, $jsonOrdDet->subtotal]);
echo json_encode([
    "resultado" => $resultado,
]);
